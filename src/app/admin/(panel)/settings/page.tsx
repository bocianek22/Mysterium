import SettingsForm from "@/components/admin/SettingsForm";

export default function SettingsPage() {
  return (
    <div>
      <h1 className="font-display text-gold-grad text-3xl mb-2 flex items-center gap-3">
        <span>⚙️</span> Ustawienia
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>
        Dane kontaktowe, adres i teksty wyświetlane na stronie.
      </p>
      <SettingsForm />
    </div>
  );
}
