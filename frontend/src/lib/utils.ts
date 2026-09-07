export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getFriendlyDate(date: Date, lang: string = "ru"): string {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const isEn = lang === "en";

  if (date.toDateString() === today.toDateString()) return isEn ? "Today" : "Сегодня";
  if (date.toDateString() === tomorrow.toDateString()) return isEn ? "Tomorrow" : "Завтра";
  if (date.toDateString() === yesterday.toDateString()) return isEn ? "Yesterday" : "Вчера";

  return date.toLocaleDateString(isEn ? "en-US" : "ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function getCurrentWeekRange(lang: string = "ru"): string {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const locale = lang === "en" ? "en-US" : "ru-RU";
  const fmt = (d: Date) =>
    d
      .toLocaleDateString(locale, { day: "numeric", month: "short" })
      .replace(".", "");

  return `${fmt(monday)} – ${fmt(sunday)}`;
}
