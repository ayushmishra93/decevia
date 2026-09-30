const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
  const source = fs.readFileSync('lib/request-origin.js', 'utf8');
  const { sameOrigin } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
  process.env.NEXTAUTH_URL = 'http://localhost:3000';
  process.env.NODE_ENV = 'development';
  const request = (url, origin) => new Request(url, { headers: origin ? { origin } : {} });
  assert.doesNotThrow(() => sameOrigin(request('http://localhost:3100/api/signup', 'http://localhost:3100')));
  assert.doesNotThrow(() => sameOrigin(request('http://127.0.0.1:3100/api/signup', 'http://127.0.0.1:3100')));
  assert.throws(() => sameOrigin(request('http://localhost:3100/api/signup', 'https://attacker.example')), { status: 403 });
  assert.throws(() => sameOrigin(request('http://localhost:3100/api/signup', null)), { status: 403 });
  process.env.NODE_ENV = 'production';
  process.env.NEXTAUTH_URL = 'https://ghostshield.example';
  assert.doesNotThrow(() => sameOrigin(request('http://internal:3000/api/signup', 'https://ghostshield.example')));
  assert.throws(() => sameOrigin(request('http://internal:3000/api/signup', 'http://internal:3000')), { status: 403 });
  assert.throws(() => sameOrigin(request('http://internal:3000/api/signup', 'https://attacker.example')), { status: 403 });
  console.log('PASS development port/host handling, production origin enforcement and cross-origin rejection');
})().catch(error => { console.error(error); process.exitCode = 1; });
