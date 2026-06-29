import { createApi } from '@crackers/api-client';
import { BrowserTokenStore } from '@crackers/api-client/browserTokenStore';
export const api = createApi({ baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1', tokens: new BrowserTokenStore() });
