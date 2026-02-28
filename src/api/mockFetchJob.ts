import { db } from '../db/db';
import type { NewsItem, KeywordNews } from '../db/db';
import { v4 as uuidv4 } from 'uuid';

type NewsType = 'mainstream' | 'niche' | 'mock';

async function fetchRealNews(keyword: string): Promise<{ title: string, url: string, source: string, type: NewsType }[]> {
    const results: { title: string, url: string, source: string, type: NewsType }[] = [];

    // 1. Google News (Mainstream articles)
    try {
        const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(keyword)}&hl=ja&gl=JP&ceid=JP:ja`;
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`;
        const response = await fetch(proxyUrl);
        const data = await response.json();

        if (data.contents) {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data.contents, "text/xml");
            const items = xmlDoc.querySelectorAll("item");

            // Get up to 3 mainstream articles
            for (let i = 0; i < Math.min(items.length, 3); i++) {
                const title = items[i].querySelector("title")?.textContent || "";
                const link = items[i].querySelector("link")?.textContent || "";
                const cleanTitle = title.split(" - ")[0] || title;
                const source = title.split(" - ")[1] || "Google News";
                results.push({ title: cleanTitle, url: link, source, type: 'mainstream' });
            }
        }
    } catch (err) {
        console.error("Mainstream RSS Fetch failed:", err);
    }

    // 2. Hatena Bookmark (Niche / Deep insights)
    try {
        const rssUrl = `https://b.hatena.ne.jp/search/text?q=${encodeURIComponent(keyword)}&mode=rss`;
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`;
        const response = await fetch(proxyUrl);
        const data = await response.json();

        if (data.contents) {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data.contents, "text/xml");
            // Hatena XML namespaces can be tricky, but querySelector('item') usually works.
            const items = xmlDoc.querySelectorAll("item");

            // Get up to 2 niche articles
            for (let i = 0; i < Math.min(items.length, 2); i++) {
                const title = items[i].querySelector("title")?.textContent || "";
                const link = items[i].querySelector("link")?.textContent || "";
                results.push({ title, url: link, source: "はてなブックマーク", type: 'niche' });
            }
        }
    } catch (err) {
        console.error("Niche RSS Fetch failed:", err);
    }

    // Shuffle to mix them
    return results.sort(() => Math.random() - 0.5);
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
        let realNews = await fetchRealNews(kw.text);

        // If fetch failed or no items, fallback to mock
        if (realNews.length === 0) {
            realNews = [
                { title: `${kw.text}に関する最新の動向分析`, url: "#", source: "Intelligence AI", type: 'mock' },
                { title: `${kw.text}が拓く次世代の可能性`, url: "#", source: "Global Report", type: 'mock' }
            ];
        }

        for (const item of realNews) {
            const id = uuidv4();
            const publishedAt = Date.now() - getRandomInt(0, 12 * 60 * 60 * 1000);

            let excerpt = `「${kw.text}」に関連する最新のニュースです。${item.title}についての詳細をスキャンしました。`;
            if (item.type === 'niche') {
                excerpt = `「${kw.text}」に関する深い考察やユニークな視点が含まれている可能性があります。`;
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
            if (item.type === 'niche') reasonStr = `「${kw.text}」のニッチ・考察記事`;
            if (item.type === 'mock') reasonStr = `「${kw.text}」の関連情報をシミュレート`;

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
    }
}
