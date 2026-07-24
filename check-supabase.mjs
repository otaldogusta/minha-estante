// check-supabase.mjs - verifica dados no Supabase
import postgres from 'postgres';

const sql = postgres('postgresql://postgres.lwmdotggpvcwhetqkyju:8jL-84e%24%40mNNPf%23@aws-0-sa-east-1.pooler.supabase.com:6543/postgres', {
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
  // Tenta com connection string direta
  console.log('\nTentando conexao direta...');
  const sql2 = postgres('postgresql://postgres:8jL-84e%24%40mNNPf%23@db.lwmdotggpvcwhetqkyju.supabase.co:5432/postgres', {
    ssl: 'require', max: 1, connect_timeout: 15,
  });
  try {
    const total = await sql2`SELECT COUNT(*) as n FROM livros`;
    console.log('Total livros (direto):', total[0].n);
    await sql2.end();
  } catch (e2) {
    console.error('Erro direto:', e2.message);
  }
} finally {
  await sql.end();
  process.exit(0);
}
