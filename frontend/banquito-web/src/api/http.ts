export const CORE_URL = import.meta.env.VITE_CORE_API_URL || 'http://localhost:8080';
export const SWITCH_URL = import.meta.env.VITE_SWITCH_API_URL || 'http://localhost:8081';
export const USE_DEMO_FALLBACK = String(import.meta.env.VITE_USE_DEMO_FALLBACK ?? 'true') === 'true';

type HttpClient = {
  get(path: string): Promise<{ data: unknown }>;
  post(path: string, payload: unknown): Promise<{ data: unknown }>;
};

function createHttpClient(baseURL: string, timeout: number): HttpClient {
  const request = async (method: 'GET' | 'POST', path: string, payload?: unknown) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${baseURL}${path}`, {
        method,
        headers: method === 'POST' && !(payload instanceof FormData) ? { 'Content-Type': 'application/json' } : undefined,
        body: method === 'POST' ? (payload instanceof FormData ? payload : JSON.stringify(payload)) : undefined,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      return { data: await response.json() };
    } finally {
      clearTimeout(timeoutId);
    }
  };

  return {
    get: (path: string) => request('GET', path),
    post: (path: string, payload: unknown) => request('POST', path, payload),
  };
}

export const coreHttp = createHttpClient(CORE_URL, 8000);
export const switchHttp = createHttpClient(SWITCH_URL, 12000);

export async function tryGet<T>(http: HttpClient, paths: string[], fallback: T): Promise<T> {
  let last: unknown;
  for (const path of paths) {
    try {
      const { data } = await http.get(path);
      return Array.isArray((data as any)?.content) ? ((data as any).content as T) : (data as T);
    } catch (err) {
      last = err;
    }
  }

  if (USE_DEMO_FALLBACK) return fallback;
  throw last;
}

export async function tryPost<T>(http: HttpClient, paths: string[], payload: unknown): Promise<T> {
  let last: unknown;
  for (const path of paths) {
    try {
      const { data } = await http.post(path, payload);
      return data as T;
    } catch (err) {
      last = err;
    }
  }

  throw last;
}
