// Usa o Web Crypto API do Node.js (igual ao navegador/Vercel)
// para gerar hash identico ao app

const senha = 'amora2026';
const saltHex = 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6';
const salt = new Uint8Array(saltHex.match(/.{2}/g).map(b => parseInt(b, 16)));
const iteracoes = 100000;

function hex(buf) {
  const b = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return [...b].map(x => x.toString(16).padStart(2, '0')).join('');
}

async function pbkdf2WebCrypto(senha, salt, iteracoes) {
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(senha),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: iteracoes },
    material,
    256
  );
  return hex(bits);
}

const h = await pbkdf2WebCrypto(senha, salt, iteracoes);
const hashCompleto = `pbkdf2$${iteracoes}$${saltHex}$${h}`;

console.log('Hash (Web Crypto):');
console.log(hashCompleto);
console.log('');
console.log('UPDATE SQL para carteiro:');
console.log(`UPDATE usuarios SET senha_hash = '${hashCompleto}' WHERE usuario = 'carteiro';`);
console.log('');
console.log('UPDATE SQL para judaviluis:');
console.log(`UPDATE usuarios SET senha_hash = '${hashCompleto}' WHERE usuario = 'judaviluis';`);
