import { DatabaseSync } from "node:sqlite";
import { FLOW_SQL_SCHEMA } from "./schema.js";

export class FlowDatabase {
  public readonly db: DatabaseSync;

  constructor(dbPath: string = ":memory:") {
    this.db = new DatabaseSync(dbPath);
    // Explicitly enforce SQLite foreign key constraints
    this.db.exec("PRAGMA foreign_keys = ON;");
  }

  /**
   * Initializes schema using bundled FLOW_SQL_SCHEMA or optional custom SQL string.
   */
  public initSchema(customSql?: string): void {
    this.db.exec(customSql || FLOW_SQL_SCHEMA);
  }

  /**
   * Executes a callback within an immediate SQLite ACID transaction.
   */
  public transaction<T>(callback: () => T): T {
    this.db.exec("BEGIN IMMEDIATE TRANSACTION;");
    try {
      const result = callback();
      this.db.exec("COMMIT;");
      return result;
    } catch (err) {
      this.db.exec("ROLLBACK;");
      throw err;
    }
  }

  /**
   * Closes database connection.
   */
  public close(): void {
    this.db.close();
  }
}
