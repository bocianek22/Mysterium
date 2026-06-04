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
      <div className="sec-label reveal">{label}</div>
      <h2 className="sec-title text-gold-grad shimmer reveal reveal-d1">{title}</h2>
      <div
        className="sec-divider reveal reveal-d2"
        style={center ? { margin: "20px auto 50px" } : undefined}
      />
    </div>
  );
}
