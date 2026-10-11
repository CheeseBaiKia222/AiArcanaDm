import {readFileSync,readdirSync} from 'node:fs';
// Existing previews predate the ledger and already contain the first three migrations.
export async function migratePreview(db,directory='database/migrations') {
  const files=readdirSync(directory).filter(f=>f.endsWith('.sql')).sort();
  const hadUsers=await db.prepare("SELECT name FROM sqlite_master WHERE name='users'").first();
  const hadLedger=await db.prepare("SELECT name FROM sqlite_master WHERE name='preview_migrations'").first();
  await db.prepare('CREATE TABLE IF NOT EXISTS preview_migrations (name TEXT PRIMARY KEY)').run();
  if(hadUsers&&!hadLedger)for(const name of files.filter(f=>/^000[0-2]_/.test(f)))await db.prepare('INSERT OR IGNORE INTO preview_migrations VALUES (?)').bind(name).run();
  for(const name of files){
    if(await db.prepare('SELECT name FROM preview_migrations WHERE name=?').bind(name).first())continue;
    const statements=readFileSync(directory+'/'+name,'utf8').split('--> statement-breakpoint').filter(s=>s.trim()).map(s=>db.prepare(s));
    await db.batch([...statements,db.prepare('INSERT INTO preview_migrations VALUES (?)').bind(name)]);
  }
}
