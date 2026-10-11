import { FlowDatabase } from "../dist/src/infrastructure/db/database.js";

const db = new FlowDatabase("./data/application.sqlite");
const now = new Date().toISOString();

db.transaction(() => {
  // 1. Create proj-ngkien & proj-stickman
  db.db.prepare("INSERT OR IGNORE INTO projects (id, name, description, created_at, updated_at) VALUES ('proj-ngkien', 'Dự án Flow - main', 'Tài khoản main (ngkien)', ?, ?)").run(now, now);
  db.db.prepare("INSERT OR IGNORE INTO projects (id, name, description, created_at, updated_at) VALUES ('proj-stickman', 'Dự án Flow - stickman', 'Tài khoản stickman', ?, ?)").run(now, now);

  // 2. Point bindings to their new projects
  db.db.prepare("UPDATE project_bindings SET project_id = 'proj-ngkien' WHERE account_id = 'ngkien' AND project_id = 'proj-default'").run();
  db.db.prepare("UPDATE project_bindings SET project_id = 'proj-stickman' WHERE account_id = 'stickman' AND project_id = 'proj-default'").run();

  // 3. Move jobs to respective projects
  db.db.prepare("UPDATE jobs SET project_id = 'proj-stickman' WHERE id = 'job-1791704009808-5i60w'").run();
  db.db.prepare("UPDATE jobs SET project_id = 'proj-ngkien' WHERE id IN ('job-1791704007642-0e024', 'job-1791715401037-tcqxo')").run();

  // 4. Delete old proj-default if empty
  db.db.prepare("DELETE FROM projects WHERE id = 'proj-default'").run();
});

console.log("MIGRATION COMPLETE!");
console.log("PROJECTS:", db.db.prepare("SELECT * FROM projects").all());
console.log("BINDINGS:", db.db.prepare("SELECT * FROM project_bindings").all());
console.log("JOBS:", db.db.prepare("SELECT id, project_id, prompt FROM jobs").all());

db.close();
