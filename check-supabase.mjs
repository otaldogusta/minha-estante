// check-supabase.mjs - verifica dados no Supabase
import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required');

const sql = postgres(databaseUrl, {
  ssl: 'require',
  max: 1,
  idle_timeout: 5,
  connect_timeout: 15,
});

try {
  const users = await sql`SELECT id, nome, usuario FROM usuarios`;
  console.log('=== USUARIOS SUPABASE ===');
  users.forEach(u => console.log(u.id, u.nome, u.usuario));

  const livros = await sql`SELECT usuario_id, COUNT(*) as total FROM livros GROUP BY usuario_id`;
  console.log('\n=== LIVROS POR USUARIO ===');
  livros.forEach(l => console.log('usuario_id:', l.usuario_id, '-> total:', l.total));

  const totalLivros = await sql`SELECT COUNT(*) as n FROM livros`;
  console.log('\nTotal livros no Supabase:', totalLivros[0].n);

} catch (e) {
  console.error('Erro ao conectar:', e.message);
} finally {
  await sql.end();
  process.exit(0);
}
