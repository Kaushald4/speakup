import { API_BASE_URL, SESSION_TOKEN_HEADER } from "@/constants/api";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

export async function request<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const { token, headers, ...rest } = options;
  const response = await fetch(apiUrl(path), {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { [SESSION_TOKEN_HEADER]: token } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    let detail = `Request failed with status ${response.status}`;
    try {
      const body = (await response.json()) as { detail?: string };
      if (body.detail) detail = body.detail;
    } catch {
      // keep default message
    }
    throw new ApiError(detail, response.status);
  }

  return (await response.json()) as T;
}
