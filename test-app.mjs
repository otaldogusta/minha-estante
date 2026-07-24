

async function checkApp() {
  console.log("Checking live Vercel app...");
  const start = Date.now();
  const res = await fetch("https://minha-estante-two.vercel.app/entrar");
  const time = Date.now() - start;
  console.log(`HTTP ${res.status} in ${time}ms`);
  const text = await res.text();
  console.log(`Page title / body length: ${text.length} bytes`);
}

checkApp();
