import { useQuery } from "@tanstack/react-query";
import { request } from "../lib/api";
import type { HealthResponse } from "../lib/todos";

export function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: () => request<HealthResponse>("/health"),
    retry: false,
    refetchInterval: 30000,
  });
}
