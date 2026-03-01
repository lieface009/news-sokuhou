import { db } from '../db/db';
import type { NewsItem, KeywordNews, Keyword } from '../db/db';
import { v4 as uuidv4 } from 'uuid';

type NewsType = 'mainstream' | 'niche';

async function fetchRealNews(keyword: string, globalSeenUrls: Set<string>): Promise<{ title: string, url: string, source: string, type: NewsType }[]> {
    const results: { title: string, url: string, source: string, type: NewsType }[] = [];
    const localSeenUrls = new Set<string>();

    const fetchGoogleNews = async (searchQuery: string, type: NewsType, maxItems: number) => {
        try {
            const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(searchQuery)}&hl=ja&gl=JP&ceid=JP:ja`;
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`;
            const response = await fetch(proxyUrl);
            const data = await response.json();

            if (data.contents) {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(data.contents, "text/xml");
                const items = xmlDoc.querySelectorAll("item");

                let count = 0;
                for (let i = 0; i < items.length; i++) {
                    if (count >= maxItems) break;

                    const title = items[i].querySelector("title")?.textContent || "";
                    let link = items[i].querySelector("link")?.textContent || "";

                    if (globalSeenUrls.has(link) || localSeenUrls.has(link)) continue;
                    localSeenUrls.add(link);

                    let cleanTitle = title.split(" - ")[0] || title;
                    let source = title.split(" - ")[1] || "Google News";

                    results.push({ title: cleanTitle, url: link, source, type });
                    count++;
                }
            }
        } catch (err) {
            console.error(`${type} RSS Fetch failed for query "${searchQuery}":`, err);
        }
    };

    const mainstreamQuery = keyword;
    const nicheQuery = `${keyword} (専門誌 OR 業界誌 OR プレスリリース OR 調査レポート OR 論文 OR 専門家)`;

    await Promise.all([
        fetchGoogleNews(mainstreamQuery, 'mainstream', 2),
        fetchGoogleNews(nicheQuery, 'niche', 1)
    ]);

    return results.sort(() => Math.random() - 0.5);
}

function getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function runMockFetchJob() {
    console.log('[FetchJob] Starting background news update...');
    const users = await db.users.toArray();
    if (users.length === 0) return;

    const keywords = await db.keywords.toArray();
    if (keywords.length === 0) return;

    const allExistingNews = await db.newsItems.toArray();
    const globalSeenUrls = new Set(allExistingNews.map(n => n.url));

    const cutoff = Date.now() - 48 * 60 * 60 * 1000;
    await db.newsItems.where('published_at').below(cutoff).delete();

    // Process all keywords in parallel
    await Promise.all(keywords.map(async (kw: Keyword) => {
        const realNews = await fetchRealNews(kw.text, globalSeenUrls);

        if (realNews.length === 0) return;

        for (const item of realNews) {
            if (globalSeenUrls.has(item.url)) continue;
            globalSeenUrls.add(item.url);

            const id = uuidv4();
            const publishedAt = Date.now() - getRandomInt(0, 12 * 60 * 60 * 1000);

            let excerpt = `「${kw.text}」に関連する最新のニュースです。${item.title}についての詳細をスキャンしました。`;
            if (item.type === 'niche') {
                excerpt = `「${kw.text}」に関する専門的な業界情報や深い考察が含まれている可能性があります。`;
            }

            const news: NewsItem = {
                id,
                source: item.source,
                title: item.title,
                url: item.url,
                excerpt: excerpt,
                content: `この記事は「${kw.text}」に基づき自動収集されました。詳細は配信元をご確認ください。`,
                language: 'ja',
                published_at: publishedAt,
                thumbnail_url: `https://picsum.photos/seed/${id}/800/600`,
                fetched_at: Date.now(),
                trust_score: getRandomInt(85, 98)
            };

            await db.newsItems.add(news);

            const matchScore = getRandomInt(90, 100);
            const recencyScore = 100;
            let reasonStr = `「${kw.text}」の主要ニュース`;
            if (item.type === 'niche') reasonStr = `「${kw.text}」の専門・業界情報`;

            const kn: KeywordNews = {
                id: uuidv4(),
                keyword_id: kw.id,
                news_item_id: news.id,
                relevance_score: matchScore,
                reason: reasonStr,
                match_score: matchScore,
                recency_score: recencyScore,
                engagement_score: getRandomInt(70, 95),
                created_at: Date.now()
            };
            await db.keywordNews.add(kn);
        }
    }));
    console.log('[FetchJob] Background news update complete.');
}

