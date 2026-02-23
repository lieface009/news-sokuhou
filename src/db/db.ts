import Dexie from 'dexie';
import type { Table } from 'dexie';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  oauth_provider: string | null;
  notification_enabled: boolean;
  fetch_interval_min: number;
  language_pref: string;
  created_at: number; // Unix timestamp
}

export interface Keyword {
  id: string;
  user_id: string;
  text: string;
  priority: 'high' | 'normal' | 'low';
  note: string;
  created_at: number;
}

export interface NewsItem {
  id: string;
  source: string;
  title: string;
  url: string;
  excerpt: string;
  content: string;
  language: string;
  published_at: number;
  thumbnail_url: string | null;
  fetched_at: number;
  trust_score: number;
}

export interface KeywordNews {
  id: string;
  keyword_id: string;
  news_item_id: string;
  relevance_score: number;
  reason: string;
  match_score: number;
  recency_score: number;
  engagement_score: number;
  created_at: number;
}

export interface Favorite {
  id: string;
  user_id: string;
  news_item_id: string;
  liked_at: number;
  note: string;
}

export interface CalendarEntry {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  keyword_ids: string[];
  created_at: number;
}

class AppDatabase extends Dexie {
  users!: Table<User>;
  keywords!: Table<Keyword>;
  newsItems!: Table<NewsItem>;
  keywordNews!: Table<KeywordNews>;
  favorites!: Table<Favorite>;
  calendarEntries!: Table<CalendarEntry>;

  constructor() {
    super('NewsSokuhoDB');
    this.version(1).stores({
      users: 'id, email',
      keywords: 'id, user_id, text',
      newsItems: 'id, url, language, published_at',
      keywordNews: 'id, keyword_id, news_item_id',
      favorites: 'id, user_id, news_item_id',
      calendarEntries: 'id, user_id, date'
    });
  }
}

export const db = new AppDatabase();
