// Production mutations must originate from the configured public application URL.
// Development servers may select a different port when the default port is busy.
export function sameOrigin(request) {
  const allowed = new Set();
  if (process.env.NEXTAUTH_URL) {
    allowed.add(new URL(process.env.NEXTAUTH_URL).origin);
  }
  if (process.env.NODE_ENV !== 'production') {
    allowed.add(new URL(request.url).origin);
  }
  const origin = request.headers.get('origin');
  if (!origin || !allowed.has(origin)) {
    throw Object.assign(new Error('Invalid request origin.'), { status: 403 });
  }
}
