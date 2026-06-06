import { useEffect, useState } from "react";
import { GraduationCap, Users, Shield, LogOut } from "lucide-react";

type Role = "learner" | "parent" | "admin";
type VisibleRole = "learner" | "parent";

const HEX: Record<Role, string> = {
  learner: "#28c9d6",
  parent:  "#ffd83a",
  admin:   "#e6519c",
};

const ICON: Record<Role, typeof GraduationCap> = {
  learner: GraduationCap,
  parent:  Users,
  admin:   Shield,
};

export function DevRoleSwitcher() {
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState<Role | "logout" | null>(null);
  const [current, setCurrent] = useState<Role | null>(null);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    setEnabled(true);
    (async () => {
      try {
        const r = await fetch("/api/auth/user", { credentials: "include" });
        if (r.ok) {
          const u = await r.json();
          if (u?.role === "learner" || u?.role === "parent" || u?.role === "admin") {
            setCurrent(u.role);
          }
        }
      } catch {/* ignore */}
    })();
  }, []);

  if (!enabled) return null;

  const loginAs = async (role: Role) => {
    setBusy(role);
    try {
      await fetch(`/api/dev/login-as/${role}`, { credentials: "include" });
      // SAFE (dev-only): `target` is always one of two hardcoded string
      // literals ("/parent" or "/dashboard") — no user or server input
      // can influence this value.  The entire component is also gated by
      // `import.meta.env.DEV` above (line 25), so this path is unreachable
      // in production builds.
      const target = role === "parent" ? "/parent" : "/dashboard";
      window.location.href = target;
    } finally {
      setBusy(null);
    }
  };

  const logout = async () => {
    setBusy("logout");
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {/* ignore */}
    window.location.href = "/";
  };

  return (
    <div
      className="fixed bottom-3 left-3 z-[9999] flex items-center gap-1 rounded-full bg-black px-2 py-1.5 text-xs"
      style={{
        border: "1px solid rgba(255,255,255,0.15)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.6)",
      }}
      data-testid="dev-role-switcher"
    >
      <span className="px-2 text-[9px] font-bold uppercase tracking-[0.16em] text-white">
        Dev · view as
      </span>
      {(["learner", "parent"] as VisibleRole[]).map((role) => {
        const Icon = ICON[role];
        const hex = HEX[role];
        const active = current === role;
        return (
          <button
            key={role}
            onClick={() => loginAs(role)}
            disabled={busy !== null}
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 transition-colors disabled:opacity-50"
            style={{
              border: `1px solid ${active ? hex : "rgba(255,255,255,0.18)"}`,
              background: active ? `${hex}18` : "transparent",
              color: active ? hex : "rgba(255,255,255,0.7)",
            }}
            data-testid={`btn-dev-login-${role}`}
          >
            <Icon className="h-3 w-3" />
            <span className="font-semibold capitalize">
              {busy === role ? "…" : role}
            </span>
          </button>
        );
      })}
      {current && (
        <button
          onClick={logout}
          disabled={busy !== null}
          className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-white hover:text-white disabled:opacity-50"
          title="Log out"
          data-testid="btn-dev-logout"
        >
          <LogOut className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
