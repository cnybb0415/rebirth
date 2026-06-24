const DEEPL_BASE = "https://api-free.deepl.com/v2";

export async function translateText(
  text: string,
  targetLang: "KO" | "EN-US"
): Promise<string> {
  const key = process.env.DEEPL_API_KEY;
  if (!key || !text.trim()) return text;

  try {
    const res = await fetch(`${DEEPL_BASE}/translate`, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: [text], target_lang: targetLang }),
    });
    if (!res.ok) return text;
    const data = await res.json();
    return (data.translations?.[0]?.text as string) ?? text;
  } catch {
    return text;
  }
}
