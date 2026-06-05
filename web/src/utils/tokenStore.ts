/**
 * In-memory JWT store. The token never touches localStorage/sessionStorage
 * to reduce XSS exfiltration risk. Trade-off: session is lost on page refresh.
 */
let accessToken: string | null = null;

export const tokenStore = {
  get(): string | null {
    return accessToken;
  },
  set(token: string | null): void {
    accessToken = token;
  },
  clear(): void {
    accessToken = null;
  },
};
