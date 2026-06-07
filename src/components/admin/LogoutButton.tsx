"use client";
import { useRouter } from "next/navigation";

export default function LogoutButton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }
  return (
    <button onClick={logout} className={className} style={style}>🚪 Wyloguj</button>
  );
}
