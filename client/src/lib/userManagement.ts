export type AdminUserRole = "user" | "admin";

export type AdminUserRow = {
  name: string | null;
  email: string | null;
  role: AdminUserRole;
};

export function filterAdminUsers<T extends AdminUserRow>(users: T[], search: string, role: "all" | AdminUserRole): T[] {
  const normalizedSearch = search.trim().toLowerCase();
  return users.filter((account) => {
    const matchesSearch = !normalizedSearch || `${account.name ?? ""} ${account.email ?? ""}`.toLowerCase().includes(normalizedSearch);
    const matchesRole = role === "all" || account.role === role;
    return matchesSearch && matchesRole;
  });
}
