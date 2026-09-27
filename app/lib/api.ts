const BASE_URL = 'https://furniturebackend-3ag7.onrender.com/api';

function authHeaders(token?: string): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Token ${token}`;
  return h;
}

export async function apiPost(endpoint: string, body: object, token?: string) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || JSON.stringify(data));
  return data;
}

export async function apiGet(endpoint: string, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Token ${token}`;
  const res = await fetch(`${BASE_URL}${endpoint}`, { headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || JSON.stringify(data));
  return data;
}

export async function apiPut(endpoint: string, body: object, token: string) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || JSON.stringify(data));
  return data;
}

export async function apiPatch(endpoint: string, body: object, token: string) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || JSON.stringify(data));
  return data;
}

export async function apiDelete(endpoint: string, token: string) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'DELETE',
    headers: { Authorization: `Token ${token}` },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || 'Delete failed');
  }
  return true;
}
