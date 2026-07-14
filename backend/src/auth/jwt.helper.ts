import * as crypto from 'crypto';

const SECRET = 'smart-ledger-super-secret-key-12345';

function base64url(source: string | Buffer): string {
  const encoded = typeof source === 'string' 
    ? Buffer.from(source).toString('base64') 
    : source.toString('base64');
  return encoded.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

export function signJwt(payload: any): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify({ 
    ...payload, 
    exp: Math.floor(Date.now() / 1000) + 86400 * 30 // 30 days expiration
  }));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  const hmac = crypto.createHmac('sha256', SECRET);
  hmac.update(signatureInput);
  const signature = base64url(hmac.digest());
  return `${signatureInput}.${signature}`;
}

export function verifyJwt(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;
    const signatureInput = `${header}.${payload}`;
    const hmac = crypto.createHmac('sha256', SECRET);
    hmac.update(signatureInput);
    const expectedSignature = base64url(hmac.digest());
    if (signature !== expectedSignature) return null;
    
    const decodedPayload = JSON.parse(
      Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
    );
    if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired token
    }
    return decodedPayload;
  } catch {
    return null;
  }
}
