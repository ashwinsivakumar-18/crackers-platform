// Framework-agnostic API client (plain JS, uses fetch). Works in React + React Native.

export class MemoryTokenStore {
  constructor() { this._a = null; this._r = null; }
  getAccess() { return this._a; }
  getRefresh() { return this._r; }
  set(a, r) { this._a = a; this._r = r; }
}

export class ApiError extends Error {
  constructor(status, message, code) { super(message); this.status = status; this.code = code; }
}

export class ApiClient {
  constructor({ baseUrl, tokens }) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.tokens = tokens || new MemoryTokenStore();
    this._refreshing = null;
  }
  _url(path, query) {
    const u = new URL(this.baseUrl + path);
    if (query) for (const [k, v] of Object.entries(query)) if (v !== undefined && v !== null && v !== '') u.searchParams.set(k, String(v));
    return u.toString();
  }
  _headers(extra) {
    const a = this.tokens.getAccess();
    return { 'Content-Type': 'application/json', ...(a ? { Authorization: `Bearer ${a}` } : {}), ...extra };
  }
  async _parse(res) {
    const text = await res.text();
    const body = text ? JSON.parse(text) : {};
    if (res.ok) return body;
    const e = body && body.error;
    throw new ApiError(res.status, (e && e.message) || `Request failed (${res.status})`, e && e.code);
  }
  async _tryRefresh() {
    const refresh = this.tokens.getRefresh();
    if (!refresh) return false;
    if (!this._refreshing) {
      this._refreshing = (async () => {
        try {
          const res = await fetch(this._url('/auth/refresh'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken: refresh }) });
          if (!res.ok) return false;
          const d = await res.json();
          this.tokens.set(d.accessToken, d.refreshToken);
          return true;
        } catch { return false; } finally { this._refreshing = null; }
      })();
    }
    return this._refreshing;
  }
  async request(method, path, { body, query, retry = true } = {}) {
    const res = await fetch(this._url(path, query), {
      method, headers: this._headers(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (res.status === 401 && retry && (await this._tryRefresh())) return this.request(method, path, { body, query, retry: false });
    return this._parse(res);
  }
  get(p, q) { return this.request('GET', p, { query: q }); }
  post(p, b) { return this.request('POST', p, { body: b }); }
  patch(p, b) { return this.request('PATCH', p, { body: b }); }
  put(p, b) { return this.request('PUT', p, { body: b }); }
  del(p) { return this.request('DELETE', p); }

  async postForm(path, form, query) {
    const a = this.tokens.getAccess();
    const res = await fetch(this._url(path, query), { method: 'POST', headers: a ? { Authorization: `Bearer ${a}` } : {}, body: form });
    return this._parse(res);
  }
  upload(file, prefix = 'uploads') {
    const form = new FormData();
    form.append('file', file);
    return this.postForm('/uploads', form, { prefix });
  }
}
