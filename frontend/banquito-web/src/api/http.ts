import axios, { AxiosInstance } from 'axios';

export const CORE_URL = import.meta.env.VITE_CORE_API_URL || 'http://localhost:8080';
export const SWITCH_URL = import.meta.env.VITE_SWITCH_API_URL || 'http://localhost:8081';
export const USE_DEMO_FALLBACK = String(import.meta.env.VITE_USE_DEMO_FALLBACK ?? 'true') === 'true';

export const coreHttp = axios.create({ baseURL: CORE_URL, timeout: 8000 });
export const switchHttp = axios.create({ baseURL: SWITCH_URL, timeout: 12000 });

export async function tryGet<T>(http: AxiosInstance, paths: string[], fallback: T): Promise<T> {
  let last: unknown;
  for (const path of paths) {
    try { const { data } = await http.get(path); return Array.isArray(data?.content) ? data.content : data; }
    catch (err) { last = err; }
  }
  if (USE_DEMO_FALLBACK) return fallback;
  throw last;
}

export async function tryPost<T>(http: AxiosInstance, paths: string[], payload: unknown): Promise<T> {
  let last: unknown;
  for (const path of paths) {
    try { const { data } = await http.post(path, payload); return data; }
    catch (err) { last = err; }
  }
  throw last;
}
