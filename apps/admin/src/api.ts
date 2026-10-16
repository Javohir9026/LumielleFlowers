const base = "/api";
export type ApiPage<T> = { data: T; meta: { page: number; limit: number; total: number; totalPages: number } };

export function redirectToLoginOnUnauthorized(response: Response, path: string) {
  if (response.status !== 401 || path === "/admin/auth/login") return;

  window.location.replace(`${import.meta.env.BASE_URL}login`);
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(base + path, { ...options, credentials: "include", headers: { "Content-Type": "application/json", ...options?.headers } });
  const json = await response.json();
  if (!response.ok) {
    redirectToLoginOnUnauthorized(response, path);
    throw new Error(json.error?.message ?? "Xatolik");
  }
  return json;
}
export async function api<T>(path: string, options?: RequestInit): Promise<T> { return (await request<{ data: T }>(path, options)).data; }
export function apiPage<T>(path: string, options?: RequestInit): Promise<ApiPage<T>> { return request<ApiPage<T>>(path, options); }
