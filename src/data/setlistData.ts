export type SetlistSong = {
  kind: "song";
  id: string;
  title: string;
  artist: string;
  note?: string;
  youtubeId: string;
  thumbnailId?: string; // 재생 ID와 다른 썸네일을 쓸 때만
};

export type SetlistBreak = {
  kind: "break";
  id: string;
  label: string;
};

export type SetlistItem = SetlistSong | SetlistBreak;

export type Setlist = {
  id: string;
  label: string;
  date?: string;
  items: SetlistItem[];
};

// ── EXO PLANET #6 – EXhOrizon ──────────────────────────────────────────────
export const exhorizonSetlist: Setlist = {
  id: "exhorizon",
  label: "EXO PLANET #6 - EXhOrizon",
  items: [
    { kind: "song",  id: "mama",                title: "MAMA",                    artist: "EXO", youtubeId: "uVAdqc1oX7g" },
    { kind: "song",  id: "monster",             title: "Monster",                 artist: "EXO", youtubeId: "KJevaDSz7Nc" },
    { kind: "song",  id: "wolf",                title: "늑대와 미녀 (Wolf)",       artist: "EXO", youtubeId: "PSoxuVfddK0" },
    { kind: "song",  id: "overdose",            title: "중독 (Overdose)",          artist: "EXO", youtubeId: "kEAzNLDNP_w", thumbnailId: "NWqC0vSVbX4" },
    { kind: "song",  id: "moonlight-shadows",   title: "Moonlight Shadows",       artist: "EXO", youtubeId: "3ELNaiY-f0U" },
    { kind: "song",  id: "gravity",             title: "Gravity",                 artist: "EXO", youtubeId: "Zq5UNt9JQMM" },
    { kind: "song",  id: "jekyll",              title: "지킬 (Jekyll)",           artist: "EXO", youtubeId: "FpoX3HJPZd8" },
    { kind: "song",  id: "crazy",               title: "Crazy",                   artist: "EXO", youtubeId: "SIAzBwljv6g", thumbnailId: "LHVF5UyKFwg" },
    { kind: "song",  id: "playboy",             title: "Playboy",                 artist: "EXO", youtubeId: "Z8OvBptveAM" },
    { kind: "song",  id: "artificial-love",     title: "Artificial Love",         artist: "EXO", youtubeId: "4kYC8YSuAps" },
    { kind: "song",  id: "the-eve",             title: "전야 (The Eve)",          artist: "EXO", youtubeId: "gK8YC0nxNe0" },
    { kind: "song",  id: "love-shot",           title: "Love Shot",               artist: "EXO", youtubeId: "KmRqHwJrTKQ" },
    { kind: "song",  id: "power",               title: "Power",                   artist: "EXO", youtubeId: "K4v7sAgwJCU" },
    { kind: "song",  id: "dont-fight-feeling",  title: "Don't Fight the Feeling", artist: "EXO", youtubeId: "IEhQpQR0PEU" },
    { kind: "song",  id: "run",                 title: "Run",                     artist: "EXO", youtubeId: "fphhWhG-INs" },
    { kind: "song",  id: "tempo",               title: "Tempo",                   artist: "EXO", youtubeId: "zJZjiaVPDiM" },
    { kind: "song",  id: "ko-ko-bop",           title: "Ko Ko Bop",               artist: "EXO", youtubeId: "J9HqEvgm3CA" },
    { kind: "song",  id: "call-me-baby",        title: "CALL ME BABY",            artist: "EXO", youtubeId: "Wu8halh9DXs" },
    { kind: "song",  id: "love-me-right",       title: "LOVE ME RIGHT",           artist: "EXO", youtubeId: "r4ZPGfwqmI0" },
    { kind: "song",  id: "growl",               title: "으르렁 (Growl)",          artist: "EXO", youtubeId: "qWvVSBUfLfE" },
    { kind: "song",  id: "baby-dont-cry",       title: "Baby Don't Cry",          artist: "EXO", youtubeId: "Qx1V-GRT0Fw" },
    { kind: "song",  id: "walking-on-memories", title: "기억을 걷는 밤",          artist: "EXO", youtubeId: "rUbOiD192iU" },
    { kind: "song",  id: "nabisoneo",           title: "나비소녀 Don't Go",       artist: "EXO", youtubeId: "xOqs9ZDDStM" },
    { kind: "song",  id: "el-dorado",           title: "EL DORADO",               artist: "EXO", youtubeId: "R3VMOXYvjQ4" },
    { kind: "song",  id: "back-it-up",          title: "Back It Up",              artist: "EXO", youtubeId: "WSApl7OXn34", thumbnailId: "nGG42t7pm5Y" },
    { kind: "song",  id: "forever",             title: "Forever",                 artist: "EXO", youtubeId: "ypsQ-2BMLDU" },
    { kind: "song",  id: "crown",               title: "Crown",                   artist: "EXO", youtubeId: "BWfKkqo1Mk8", thumbnailId: "mbiN9853aic" },
    { kind: "song",  id: "back-pocket",         title: "Back Pocket",             artist: "EXO", youtubeId: "3kMTU4vGvc0" },
    { kind: "song",  id: "flatline",            title: "Flatline",                artist: "EXO", youtubeId: "6SBvwaQKHXc" },
    { kind: "song",  id: "into-your-world",     title: "너의 세상으로",           artist: "EXO", youtubeId: "Fl4fQY9dl1A" },
  ],
};

export function getSongs(setlist: Setlist): SetlistSong[] {
  return setlist.items.filter((item): item is SetlistSong => item.kind === "song");
}
