import { DatabaseSync } from "node:sqlite";
import { FLOW_SQL_SCHEMA } from "./schema.js";

export class FlowDatabase {
  public readonly db: DatabaseSync;
  private transactionDepth = 0;

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
   * Supports nested transactions seamlessly via SQLite SAVEPOINTs.
   */
  public transaction<T>(callback: () => T): T {
    const isRoot = this.transactionDepth === 0;
    const savepointName = `sp_${this.transactionDepth}`;
    this.transactionDepth++;

    if (isRoot) {
      this.db.exec("BEGIN IMMEDIATE TRANSACTION;");
    } else {
      this.db.exec(`SAVEPOINT ${savepointName};`);
    }

    try {
      const result = callback();
      if (isRoot) {
        this.db.exec("COMMIT;");
      } else {
        this.db.exec(`RELEASE SAVEPOINT ${savepointName};`);
      }
      return result;
    } catch (err) {
      if (isRoot) {
        this.db.exec("ROLLBACK;");
      } else {
        this.db.exec(`ROLLBACK TO SAVEPOINT ${savepointName};`);
      }
      throw err;
    } finally {
      this.transactionDepth--;
    }
  }

  /**
   * Closes database connection.
   */
  public close(): void {
    this.db.close();
  }
}
