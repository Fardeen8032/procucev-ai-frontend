const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';

async function request(path, options = {}) {
  const res = await fetch(`${SERVER_URL}/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const transcriptionsApi = {
  list: () => request('/transcriptions'),
  get: (id) => request(`/transcriptions/${id}`),
  create: (data) => request('/transcriptions', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/transcriptions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => request(`/transcriptions/${id}`, { method: 'DELETE' }),
};

export { SERVER_URL };
