import postgres from 'postgres';

const passNew = 'aZ6w5IOtjyiqyg5E';
const sql = postgres(`postgresql://postgres.lwmdotggpvcwhetqkyju:${passNew}@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`, { ssl: 'require' });

console.log('=== LIVROS DA JUDAVILUIS (usuario_id = 1) ===');
const books = await sql`
  SELECT id, titulo, autor, status, privado, ano_leitura, inicio, fim, criado_em 
  FROM livros 
  WHERE usuario_id = 1 
  ORDER BY CASE status WHEN 'lendo' THEN 0 WHEN 'quero_ler' THEN 1 ELSE 2 END,
           ano_leitura DESC, COALESCE(fim, inicio, CAST(criado_em AS TEXT)) DESC, id DESC
`;

console.log(`Total de livros retornados pela query: ${books.length}`);
console.log('Primeiros 5 livros:', books.slice(0, 5));

// Checar se a coluna privado esta como 0 ou 1 ou null
const priv = await sql`SELECT privado, COUNT(*) FROM livros WHERE usuario_id = 1 GROUP BY privado`;
console.log('Distribuição de privado:', priv);

// Checar se a coluna status tem valores estranhos
const st = await sql`SELECT status, COUNT(*) FROM livros WHERE usuario_id = 1 GROUP BY status`;
console.log('Distribuição de status:', st);

await sql.end();
process.exit(0);
