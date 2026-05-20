import { type Role, useRole } from "@/hooks/useRole";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";

export interface AuthState {
  isAuthenticated: boolean;
  principal: string | null;
  role: Role;
}

export function useAuth(): AuthState {
  const { identity, loginStatus } = useInternetIdentity();
  const role = useRole();
  const isAuthenticated = loginStatus === "success";
  const principal = isAuthenticated
    ? (identity?.getPrincipal()?.toText() ?? null)
    : null;

  return { isAuthenticated, principal, role };
}
