export type UserRole = "customer" | "business" | "admin";

export type Session = {
  token: string;
  user: { name: string; email?: string; role: UserRole };
};

const SESSION_KEY = "plateful_session";

export function saveSession(session: Session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;

  try {
    const value = JSON.parse(localStorage.getItem(SESSION_KEY) ?? "null") as Session | null;
    if (value?.token && value.user?.role) return value;

    const token = localStorage.getItem("plateful_token");
    const role = localStorage.getItem("plateful_role") as UserRole | null;
    return token && role ? { token, user: { name: "Plateful member", role } } : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem("plateful_token");
  localStorage.removeItem("plateful_role");
}

export function dashboardFor(role: UserRole) {
  return role === "business" ? "/business" : role === "admin" ? "/admin" : "/customer";
}
