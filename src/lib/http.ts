const API_BASE_URL = "/.netlify/functions";

interface JsonRequestOptions extends RequestInit {
  body?: unknown;
}

export const fetchJson = async <T = unknown>(
  path: string,
  options: JsonRequestOptions = {}
): Promise<T> => {
  const { body, headers, ...rest } = options;
  const finalHeaders = new Headers(headers);
  let fetchBody: BodyInit | undefined;

  if (body !== undefined) {
    fetchBody = JSON.stringify(body);
    if (!finalHeaders.has("Content-Type")) {
      finalHeaders.set("Content-Type", "application/json");
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: fetchBody,
    credentials: "include",
  });

  const text = await response.text();
  const data = text ? (JSON.parse(text) as T) : (undefined as T);

  if (!response.ok) {
    const message =
      typeof data === "object" && data && "message" in (data as Record<string, unknown>)
        ? String((data as Record<string, unknown>).message)
        : response.statusText;
    const error = new Error(message);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  return data;
};
