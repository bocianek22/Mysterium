// Pomocniki do adresu — pozwalają, by adres z panelu sterował całą stroną.
// Format docelowy: "Ulica 12, 00-000 Miasto" (ale działa też dla innych).

export function addressCity(address?: string | null): string {
  if (!address) return "";
  // część po kodzie pocztowym, np. "... 05-100 Nowy Dwór Mazowiecki" -> "Nowy Dwór Mazowiecki"
  const m = address.match(/\d{2}-\d{3}\s+(.+)$/);
  if (m) return m[1].trim();
  // w przeciwnym razie ostatni fragment po przecinku
  const parts = address.split(",");
  return parts[parts.length - 1].trim();
}

export function addressStreet(address?: string | null): string {
  if (!address) return "";
  const parts = address.split(",");
  return parts[0].trim();
}

// Skrót do chipa: "Ulica 12 · Miasto"
export function addressShort(address?: string | null): string {
  const street = addressStreet(address);
  const city = addressCity(address);
  if (street && city) return `${street} · ${city}`;
  return address || "";
}
