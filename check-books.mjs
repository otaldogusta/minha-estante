import postgres from 'postgres';

const passNew = 'aZ6w5IOtjyiqyg5E';
const sql = postgres(`postgresql://postgres.lwmdotggpvcwhetqkyju:${passNew}@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`, { ssl: 'require' });

console.log('=== USERS IN SUPABASE ===');
const users = await sql`SELECT id, nome, usuario FROM usuarios`;
console.log(users);

console.log('\n=== BOOKS SUMMARY BY USUARIO_ID ===');
const summary = await sql`SELECT usuario_id, COUNT(*) as count FROM livros GROUP BY usuario_id`;
console.log(summary);

console.log('\n=== SAMPLE BOOKS ===');
const sample = await sql`SELECT id, titulo, autor, usuario_id, status FROM livros LIMIT 10`;
console.log(sample);

await sql.end();
process.exit(0);
