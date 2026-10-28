import AsyncStorage from '@react-native-async-storage/async-storage';

// Use 10.0.2.2 for the Android emulator or your machine's LAN IP on a physical device.
export const BASE_URL = 'http://192.168.254.158:8080'; // physical device IP

async function authHeaders() {
  const token = await AsyncStorage.getItem('token');
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

const REQUEST_TIMEOUT_MS = 15_000;

async function request(path: string, options: RequestInit, timeoutMs?: number) {
  const controller = timeoutMs === undefined ? undefined : new AbortController();
  const timeout = controller && timeoutMs !== undefined
    ? setTimeout(() => controller.abort(), timeoutMs)
    : undefined;

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      ...(controller ? { signal: controller.signal } : {}),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? `Request failed (${res.status})`);
    return data;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timed out. Check that the API is running and reachable at ${BASE_URL}.`);
    }
    if (
      error instanceof TypeError ||
      (error instanceof Error && /fetch failed|network request failed|network error/i.test(error.message))
    ) {
      throw new Error(`Cannot reach the API at ${BASE_URL}. Check the server address, network, and firewall.`);
    }
    throw error;
  } finally {
    if (timeout !== undefined) clearTimeout(timeout);
  }
}

async function post(path: string, body: object, auth = true, timeoutMs?: number) {
  const headers = auth ? await authHeaders() : { 'Content-Type': 'application/json' };
  return request(path, { method: 'POST', headers, body: JSON.stringify(body) }, timeoutMs);
}

async function get(path: string) {
  return request(path, { headers: await authHeaders() });
}

export const api = {
  login: (mobile: string, pin: string) =>
    post('/api/auth/login', { mobile, pin }, false, REQUEST_TIMEOUT_MS),

  register: (mobile: string, pin: string, fullName: string) =>
    post('/api/auth/register', { mobile, pin, fullName }, false, REQUEST_TIMEOUT_MS),

  getBalance: () => get('/api/account/balance'),

  cashIn: (amount: number) => post('/api/account/cashin', { amount }),

  transfer: (receiverMobile: string, amount: number) =>
    post('/api/account/transfer', { receiverMobile, amount }),

  getTransactions: () => get('/api/account/transactions'),
};
