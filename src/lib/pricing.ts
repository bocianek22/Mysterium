// Wycena gry na podstawie cennika pokoju (Room.pricingJson) + rabaty.
export type PriceTier = { labelPl?: string; labelEn?: string; price?: number };

export function parsePricing(json?: string | null): PriceTier[] {
  try {
    const arr = JSON.parse(json || "[]");
    if (!Array.isArray(arr)) return [];
    return arr
      .map((t: any) => ({ labelPl: t.labelPl ?? t.label ?? "", labelEn: t.labelEn ?? t.label ?? "", price: Number(t.price) || 0 }))
      .filter((t: PriceTier) => (t.price || 0) > 0);
  } catch {
    return [];
  }
}

// Spróbuj dopasować cenę do liczby osób na podstawie liczb zawartych w etykiecie
// (np. "2-3 osoby", "do 4", "5 osób"). Gdy brak dopasowania — najtańszy próg.
export function estimatePrice(tiers: PriceTier[], people: number): number {
  if (!tiers.length) return 0;
  let best: { price: number; score: number } | null = null;
  for (const t of tiers) {
    const label = `${t.labelPl || ""} ${t.labelEn || ""}`;
    const nums = (label.match(/\d+/g) || []).map(Number);
    let match = false;
    if (nums.length >= 2) match = people >= Math.min(nums[0], nums[1]) && people <= Math.max(nums[0], nums[1]);
    else if (nums.length === 1) {
      if (/do|max|≤|<=|up to/i.test(label)) match = people <= nums[0];
      else if (/od|min|≥|>=|from/i.test(label)) match = people >= nums[0];
      else match = people === nums[0];
    }
    if (match) return t.price || 0;
    // fallback: najtańszy próg
    if (!best || (t.price || 0) < best.price) best = { price: t.price || 0, score: 0 };
  }
  return best?.price || 0;
}

export function applyDiscount(price: number, kind: string, value: number): number {
  if (price <= 0) return 0;
  const out = kind === "PERCENT" ? price * (1 - value / 100) : price - value;
  return Math.max(0, Math.round(out * 100) / 100);
}
