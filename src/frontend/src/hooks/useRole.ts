import { useInternetIdentity } from "@caffeineai/core-infrastructure";

export type Role = "supervisor" | "operator";

export function useRole(): Role {
  const { loginStatus } = useInternetIdentity();
  return loginStatus === "success" ? "supervisor" : "operator";
}
