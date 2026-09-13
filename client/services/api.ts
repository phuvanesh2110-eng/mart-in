const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API error", { url, status: response.status, errorData });

      // Return sensible fallbacks instead of throwing to avoid runtime overlay in dev
      if (endpoint.includes("/passes") || endpoint.includes("/products") || endpoint.includes("/orders") || endpoint.endsWith("s")) {
        return ([] as unknown) as T;
      }

      return (errorData as T) || ({} as T);
    }

    // Parse JSON safely
    const data = await response.json().catch(() => ({}));
    return data as T;
  } catch (err) {
    // Network error (server unreachable) or other unexpected failures
    console.error("Network or fetch error for", url, err);

    // Provide default empty fallbacks for common list endpoints to keep UI stable
    if (endpoint.includes("/passes") || endpoint.includes("/products") || endpoint.includes("/orders") || endpoint.endsWith("s")) {
      return ([] as unknown) as T;
    }

    return ({} as T);
  }
}