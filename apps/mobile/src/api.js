import AsyncStorage from '@react-native-async-storage/async-storage';
import { createApi } from '@crackers/api-client';

// Sync token store hydrated from AsyncStorage at boot; persists on set.
class RNTokenStore {
  constructor() { this._a = null; this._r = null; }
  async hydrate() {
    this._a = await AsyncStorage.getItem('access_token');
    this._r = await AsyncStorage.getItem('refresh_token');
  }
  getAccess() { return this._a; }
  getRefresh() { return this._r; }
  set(a, r) {
    this._a = a; this._r = r;
    if (a) AsyncStorage.setItem('access_token', a); else AsyncStorage.removeItem('access_token');
    if (r) AsyncStorage.setItem('refresh_token', r); else AsyncStorage.removeItem('refresh_token');
  }
}
export const tokenStore = new RNTokenStore();

// Android emulator reaches the host machine at 10.0.2.2; iOS sim uses localhost.
const BASE = process.env.API_BASE_URL || 'http://10.0.2.2:4000/api/v1';
export const api = createApi({ baseUrl: BASE, tokens: tokenStore });
