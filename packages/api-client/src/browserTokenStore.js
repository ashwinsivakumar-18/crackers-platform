// localStorage-backed token store for browsers (SSR-safe no-op fallback).
export class BrowserTokenStore {
  constructor() { this._m = { a: null, r: null }; }
  get _ls() { return typeof window !== 'undefined' ? window.localStorage : null; }
  getAccess() { return this._ls ? this._ls.getItem('access_token') : this._m.a; }
  getRefresh() { return this._ls ? this._ls.getItem('refresh_token') : this._m.r; }
  set(a, r) {
    if (this._ls) {
      a ? this._ls.setItem('access_token', a) : this._ls.removeItem('access_token');
      r ? this._ls.setItem('refresh_token', r) : this._ls.removeItem('refresh_token');
    } else this._m = { a, r };
  }
}
