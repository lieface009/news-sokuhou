import { db } from '../db/db';
import type { NewsItem, KeywordNews } from '../db/db';
import { v4 as uuidv4 } from 'uuid';

const MOCK_SOURCES = [
    { name: 'TechNews Japan', domain: 'technews-jp.test', trust: 92 },
    { name: 'Financial Times Mock', domain: 'finance-times.test', trust: 95 },
    { name: 'AI Daily Report', domain: 'ai-daily.test', trust: 88 },
    { name: 'World Global Press', domain: 'world-press.test', trust: 90 }
];

function generateMockTitle(keywordText: string): string {
    const templates = [
        `${keywordText}の衝撃的な最新トレンド：業界が激震`,
        `専門家が分析する${keywordText}の次なる一手とは`,
        `【独占】${keywordText}関連の新プロジェクトが秘密裏に始動`,
        `${keywordText}市場、前年比200%の驚異的な成長を記録`,
        `知らないと損をする${keywordText}活用の最前線`,
        `${keywordText}が変える私たちの生活：2026年への展望`,
    ];
    return templates[Math.floor(Math.random() * templates.length)];
}

function getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function runMockFetchJob() {
    const users = await db.users.toArray();
    if (users.length === 0) return;

    const keywords = await db.keywords.toArray();
    if (keywords.length === 0) return;

    // Cleanup old items to prevent clutter
    const cutoff = Date.now() - 48 * 60 * 60 * 1000;
    await db.newsItems.where('published_at').below(cutoff).delete();

    for (const kw of keywords) {
        const numItems = getRandomInt(2, 4);
        for (let i = 0; i < numItems; i++) {
            const source = MOCK_SOURCES[getRandomInt(0, MOCK_SOURCES.length - 1)];
            const id = uuidv4();
            const title = generateMockTitle(kw.text);
            const publishedAt = Date.now() - getRandomInt(0, 24 * 60 * 60 * 1000);

            // Ensure at least the first one per keyword is Japanese
            const lang = i === 0 ? 'ja' : (Math.random() > 0.5 ? 'ja' : 'en');
            const isJA = lang === 'ja';

            const news: NewsItem = {
                id,
                source: source.name,
                title: isJA ? title : `Global Insights: ${kw.text} Trends`,
                url: `https://${source.domain}/article/${id}`,
                excerpt: isJA
                    ? `${title}に関しての詳報です。今回の動向は${kw.text}に関連する市場全体に大きな影響を与える可能性があります。`
                    : `Comprehensive update on ${kw.text} and its global implications in the current market.`,
                content: `Simulation content for ${kw.text}.`,
                language: lang,
                published_at: publishedAt,
                thumbnail_url: `https://picsum.photos/seed/${id}/800/600`,
                fetched_at: Date.now(),
                trust_score: source.trust
            };

            await db.newsItems.add(news);

            const matchScore = getRandomInt(80, 100);
            const recencyScore = Math.max(0, 100 - Math.floor((Date.now() - publishedAt) / (60 * 60 * 1000)) * 4);

            const kn: KeywordNews = {
                id: uuidv4(),
                keyword_id: kw.id,
                news_item_id: news.id,
                relevance_score: matchScore,
                reason: `「${kw.text}」への高い一致度を確認`,
                match_score: matchScore,
                recency_score: recencyScore,
                engagement_score: getRandomInt(60, 95),
                created_at: Date.now()
            };
            await db.keywordNews.add(kn);
        }
    }
}
