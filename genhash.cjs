const crypto = require('crypto');

const senha = 'amora2026';
const salt = Buffer.from('a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', 'hex');

crypto.pbkdf2(senha, salt, 100000, 32, 'sha256', (err, key) => {
  if (err) { console.error(err); return; }
  const saltHex = salt.toString('hex');
  const hashHex = key.toString('hex');
  const hashCompleto = `pbkdf2$100000$${saltHex}$${hashHex}`;
  console.log('Hash gerado:');
  console.log(hashCompleto);
  console.log('');
  console.log('SQL para atualizar senha do carteiro:');
  console.log(`UPDATE usuarios SET senha_hash = '${hashCompleto}' WHERE usuario = 'carteiro';`);
  console.log('');
  console.log('SQL para verificar usuarios existentes:');
  console.log("SELECT id, nome, usuario FROM usuarios;");
});
