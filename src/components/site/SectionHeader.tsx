export default function SectionHeader({
  label,
  title,
  center,
}: {
  label: string;
  title: React.ReactNode;
  center?: boolean;
}) {
  return (
    <div className={center ? "text-center" : ""}>
      <div className="sec-label">{label}</div>
      <h2 className="sec-title text-gold-grad">{title}</h2>
      <div className="sec-divider" style={center ? { margin: "20px auto 50px" } : undefined} />
    </div>
  );
}
