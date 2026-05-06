const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const port = 8000;

export const environment = {
  production: false,
  apiUrl: `${protocol}//${hostname}:${port}`,
  authTokenStorageKey: 'tienda_access_token',
};
