import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

function getDb(): SupabaseClient {
  if (!_client) {
    if (!process.env.SUPABASE_URL) throw new Error("SUPABASE_URL is not set");
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
    _client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  }
  return _client;
}

// ── Site-facing Announcement types (mirrors announcements.ts) ────────────────
export type AnnouncementContentLine = string | { text: string; emphasis?: boolean };

export type AnnouncementImage = { src: string; alt: string };

export type AnnouncementLocalizedSection = {
  label: string;
  images: AnnouncementImage[];
  content?: AnnouncementContentLine[];
};

export type AnnouncementItem = {
  id: string;
  title: string;
  localizedTitles?: { en?: string; zh?: string; ja?: string };
  date: string;
  content: AnnouncementContentLine[];
  images?: AnnouncementImage[];
  localizedImages?: AnnouncementLocalizedSection[];
  actions?: Array<{ label: string; href: string }>;
  ticketLinks?: { mobile: string; desktop: string };
};

// ── Concert Notices ───────────────────────────────────────
export type ConcertNotice = {
  id: string;
  title: string;
  title_en?: string | null;
  title_zh?: string | null;
  title_ja?: string | null;
  date: string;
  content: unknown;
  images?: unknown;
  actions?: unknown;
  ticket_links?: unknown;
  published: boolean;
  created_at: string;
};

function dbRowToAnnouncement(row: ConcertNotice): AnnouncementItem {
  const rawImages = row.images as unknown[] | null;
  let simpleImages: AnnouncementImage[] | undefined;
  let localizedImages: AnnouncementLocalizedSection[] | undefined;
  if (Array.isArray(rawImages) && rawImages.length > 0) {
    if (typeof (rawImages[0] as Record<string, unknown>).label === "string") {
      localizedImages = rawImages as AnnouncementLocalizedSection[];
    } else {
      simpleImages = rawImages as AnnouncementImage[];
    }
  }
  return {
    id: row.id,
    title: row.title,
    localizedTitles: { en: row.title_en ?? undefined, zh: row.title_zh ?? undefined, ja: row.title_ja ?? undefined },
    date: row.date,
    content: (row.content as AnnouncementContentLine[]) ?? [],
    images: simpleImages,
    localizedImages,
    actions: (row.actions as Array<{ label: string; href: string }>) ?? undefined,
    ticketLinks: (row.ticket_links as { mobile: string; desktop: string }) ?? undefined,
  };
}

export async function getPublishedNoticesForSite(): Promise<AnnouncementItem[]> {
  try {
    const { data, error } = await getDb()
      .from("concert_notices")
      .select("*")
      .eq("published", true)
      .order("date", { ascending: false });
    if (error) return [];
    return (data as ConcertNotice[]).map(dbRowToAnnouncement);
  } catch {
    return [];
  }
}

export async function getNoticeByIdForSite(id: string): Promise<AnnouncementItem | null> {
  try {
    const { data, error } = await getDb()
      .from("concert_notices")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) return null;
    return dbRowToAnnouncement(data as ConcertNotice);
  } catch {
    return null;
  }
}

export async function getNotices(): Promise<ConcertNotice[]> {
  const { data, error } = await getDb()
    .from("concert_notices")
    .select("*")
    .order("date", { ascending: false });
  if (error) throw new Error(error.message);
  return data as ConcertNotice[];
}

export async function createNotice(notice: Omit<ConcertNotice, "created_at">): Promise<void> {
  const { error } = await getDb().from("concert_notices").insert(notice);
  if (error) throw new Error(error.message);
}

export async function updateNotice(id: string, patch: Partial<ConcertNotice>): Promise<void> {
  const { error } = await getDb().from("concert_notices").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteNotice(id: string): Promise<void> {
  const { error } = await getDb().from("concert_notices").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ── Schedule Items ────────────────────────────────────────
export type ScheduleItem = {
  id: string;
  date: string;
  time?: string | null;
  title: string;
  category: string;
  city?: string | null;
  country?: string | null;
  venue?: string | null;
  published: boolean;
  created_at: string;
};

export async function getScheduleItems(): Promise<ScheduleItem[]> {
  const { data, error } = await getDb()
    .from("schedule_items")
    .select("*")
    .order("date", { ascending: true });
  if (error) throw new Error(error.message);
  return data as ScheduleItem[];
}

export async function createScheduleItem(item: Omit<ScheduleItem, "created_at">): Promise<void> {
  const { error } = await getDb().from("schedule_items").insert(item);
  if (error) throw new Error(error.message);
}

export async function updateScheduleItem(id: string, patch: Partial<ScheduleItem>): Promise<void> {
  const { error } = await getDb().from("schedule_items").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteScheduleItem(id: string): Promise<void> {
  const { error } = await getDb().from("schedule_items").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteAllScheduleItems(): Promise<void> {
  const { error } = await getDb().from("schedule_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) throw new Error(error.message);
}
