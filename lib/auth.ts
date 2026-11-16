export const AUTH_COOKIE = "selite_dashboard_session";
export const DEMO_EMAIL = "admin@selitelifestyle.com";
export const DEMO_PASSWORD = "seliteadmin";

export function isValidCredentials(email: string, password: string) {
  return email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD;
}
