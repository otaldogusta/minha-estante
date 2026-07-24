import postgres from 'postgres';

async function testConn(name, connStr) {
  console.log(`Testing ${name}...`);
  const sql = postgres(connStr, { ssl: 'require', max: 1, idle_timeout: 5, connect_timeout: 8 });
  try {
    const res = await sql`SELECT COUNT(*) as n FROM usuarios`;
    console.log(`✅ ${name} SUCCESS! Total users: ${res[0].n}`);
    return true;
  } catch (e) {
    console.log(`❌ ${name} FAILED: ${e.message}`);
    return false;
  } finally {
    await sql.end();
  }
}

const passNew = 'aZ6w5IOtjyiqyg5E';
const passOld = '8jL-84e%24%40mNNPf%23'; // 8jL-84e$@mNNPf#

// Direct 5432 with new pass
await testConn('Direct (5432) New Pass', `postgresql://postgres:${passNew}@db.lwmdotggpvcwhetqkyju.supabase.co:5432/postgres`);
// Direct 5432 with old pass
await testConn('Direct (5432) Old Pass', `postgresql://postgres:${passOld}@db.lwmdotggpvcwhetqkyju.supabase.co:5432/postgres`);

// Pooler 6543 with new pass
await testConn('Pooler (6543) New Pass', `postgresql://postgres.lwmdotggpvcwhetqkyju:${passNew}@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`);
// Pooler 6543 with old pass
await testConn('Pooler (6543) Old Pass', `postgresql://postgres.lwmdotggpvcwhetqkyju:${passOld}@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`);

process.exit(0);
