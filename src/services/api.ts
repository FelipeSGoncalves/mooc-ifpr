export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/mooc";

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details: unknown = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

async function parseResponseBody(response: Response) {
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return response.json();
  }
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiRequest<TResponse>(
  path: string,
  init: RequestInit = {}
): Promise<TResponse> {
  // Convert Headers to plain object with proper typing
  const headers: Record<string, string> = {
    ...Object.fromEntries(
      init.headers instanceof Headers
        ? init.headers.entries()
        : init.headers && typeof init.headers === 'object'
        ? Object.entries(init.headers)
        : []
    )
  };

  // Only set Content-Type if body is not FormData
  if (!(init.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
    ...init,
    headers,
  });
  // Se for FormData, o navegador vai definir o Content-Type automaticamente com o boundary correto.


  // --- FIM DA CORREÇÃO ---

  const data = await parseResponseBody(response);

  if (!response.ok) {
    const message =
      (typeof data === "object" && data !== null && "message" in data
        ? String((data as Record<string, unknown>).message)
        : undefined) ||
      (typeof data === "string" && data.trim().length > 0 ? data : undefined) ||
      "Erro ao realizar requisição.";

    throw new ApiError(message, response.status, data);
  }

  return data as TResponse;
}