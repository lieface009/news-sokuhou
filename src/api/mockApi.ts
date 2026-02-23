import { db } from '../db/db';
import type { Keyword, NewsItem } from '../db/db';
import { v4 as uuidv4 } from 'uuid';

/**
 * Score calculation based on spec:
 * Match (50%), Recency (20%), Trust (20%), Engagement (10%)
 * Plus Keyword Weighting (High: x1.5, Normal: x1.0, Low: x0.7)
 */
function calculateScore(match: number, recency: number, trust: number, engagement: number, weight = 1.0) {
    let score = (0.5 * match + 0.2 * recency + 0.2 * trust + 0.1 * engagement) * weight;
    return Math.min(100, Math.round(score));
}

export const mockApi = {
    async getKeywords(userId: string) {
        return db.keywords.where('user_id').equals(userId).toArray();
    },

    async createKeyword(userId: string, text: string, priority: 'high' | 'normal' | 'low', note: string) {
        const count = await db.keywords.where('user_id').equals(userId).count();
        if (count >= 30) throw new Error('Keyword limit reached (max 30)');

        const kw: Keyword = {
            id: uuidv4(),
            user_id: userId,
            text: text.trim(),
            priority,
            note,
            created_at: Date.now()
        };
        await db.keywords.add(kw);
        return kw;
    },

    async updateKeyword(id: string, updates: Partial<Keyword>) {
        await db.keywords.update(id, updates);
    },

    async updateKeywordPriority(id: string, priority: 'high' | 'normal' | 'low') {
        await db.keywords.update(id, { priority });
    },

    async deleteKeyword(id: string) {
        await db.keywords.delete(id);
        await db.keywordNews.where('keyword_id').equals(id).delete();
    },

    async getTopNews(keywordIds: string[]) {
        // Artificial slight delay for feedback
        await new Promise(r => setTimeout(r, 400));

        if (!Array.isArray(keywordIds) || keywordIds.length === 0) return [];

        // 1. Fetch all news linked to ANY of the selected keywords
        const links = await db.keywordNews.where('keyword_id').anyOf(keywordIds).toArray();

        if (links.length === 0) {
            // Fallback: If no links found for these keywords, just get the latest news items
            // to avoid an empty feed experience.
            const latest = await db.newsItems.orderBy('published_at').reverse().limit(5).toArray();
            return latest.map((news, idx) => ({
                rank: idx + 1,
                score: news.trust_score, // Fallback score
                reason: 'Recommended for you',
                news
            }));
        }

        // 2. Map to aggregate results by news_item_id
        const newsMap = new Map<string, { score: number; reasons: string[]; data: NewsItem }>();

        const kwMap = new Map<string, Keyword>();
        for (const kid of keywordIds) {
            const k = await db.keywords.get(kid);
            if (k) kwMap.set(kid, k);
        }

        for (const link of links) {
            const news = await db.newsItems.get(link.news_item_id);
            if (!news) continue;

            const kw = kwMap.get(link.keyword_id);
            if (!kw) continue;

            const weight = kw.priority === 'high' ? 1.5 : kw.priority === 'normal' ? 1.0 : 0.7;

            const currentScore = calculateScore(
                link.match_score,
                link.recency_score,
                news.trust_score,
                link.engagement_score,
                weight
            );

            // Only consider reasonably relevant news (80% match score or higher total score)
            if (currentScore < 60 && link.match_score < 75) continue;

            const reason = `Keyword: ${kw.text}`;

            const existing = newsMap.get(news.id);
            if (existing) {
                if (!existing.reasons.includes(reason)) existing.reasons.push(reason);
                // Boost score if article matches multiple selected keywords (aggregation bonus)
                existing.score = Math.min(100, existing.score + (currentScore * 0.25));
            } else {
                newsMap.set(news.id, {
                    score: currentScore,
                    reasons: [reason],
                    data: news
                });
            }
        }

        let items = Array.from(newsMap.values()).sort((a, b) => b.score - a.score);

        // Limit results but ensure we show mixing even if scores are 80-90
        return items.slice(0, 10).map((it, idx) => ({
            rank: idx + 1,
            score: Math.round(it.score),
            reason: it.reasons.join(' + '),
            news: it.data
        }));
    },

    async toggleFavorite(userId: string, newsItemId: string) {
        const existing = await db.favorites.where({ user_id: userId, news_item_id: newsItemId }).first();
        if (existing) {
            await db.favorites.delete(existing.id);
            return false;
        } else {
            await db.favorites.add({
                id: uuidv4(),
                user_id: userId,
                news_item_id: newsItemId,
                liked_at: Date.now(),
                note: ''
            });
            return true;
        }
    },

    async isFavorite(userId: string, newsItemId: string) {
        const count = await db.favorites.where({ user_id: userId, news_item_id: newsItemId }).count();
        return count > 0;
    },

    async getFavorites(userId: string) {
        const favs = await db.favorites.where('user_id').equals(userId).toArray();
        const items = [];
        for (const f of favs) {
            const news = await db.newsItems.get(f.news_item_id);
            if (news) items.push(news);
        }
        return items;
    },

    async updateLanguage(userId: string, lang: string) {
        // Simple mock for language preference
        localStorage.setItem(`lang_${userId}`, lang);
        return true;
    }
};
