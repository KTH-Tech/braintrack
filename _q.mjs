import pg from "pg";
const sqlText = process.argv[2];
const c = new pg.Client({ connectionString: process.env.DATABASE_URL });
await c.connect();
const r = await c.query(sqlText);
console.log(JSON.stringify(r.rows, null, 2));
await c.end();
process.exit(0);
