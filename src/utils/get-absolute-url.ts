export function getAbsoluteUrl(): string {
  // Force fixed domain for production - ignore VERCEL_URL to avoid preview URL issues
  if (process.env.NODE_ENV === 'production') {
    return 'https://mg3-nexus-dashboard.vercel.app';
  }
  
  // Development fallback
  const defaultUrl = 'http://localhost:3000';
  if (process.env.APP_URL != null) return process.env.APP_URL;
  
  return defaultUrl;
}
