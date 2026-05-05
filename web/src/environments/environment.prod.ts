const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';
const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const port = 8000;

export const environment = {
  production: true,
  apiUrl: `${protocol}//${hostname}:${port}`,
  authTokenStorageKey: 'tienda_access_token',
};
