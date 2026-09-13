import { getLocalDB } from "./src/lib/d1-local.js";
const db = getLocalDB();
console.log("DB is Postgres?", db.isPostgres ? "YES" : "NO");
