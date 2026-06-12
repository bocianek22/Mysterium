"use client";

export default function CookieSettingsLink({ label }: { label: string }) {
  return (
    <button
      onClick={() => window.dispatchEvent(new Event("open-cookie-settings"))}
      className="text-xs no-underline ml-4 bg-transparent"
      style={{ color: "var(--gold-l)" }}
    >
      {label}
    </button>
  );
}
