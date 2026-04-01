import { getDatabase } from '@/db/client';

async function createChequeTable() {
  const db = await getDatabase();

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS cheques (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      beneficiary TEXT NOT NULL,
      amount REAL NOT NULL,
      chequeNumber TEXT NOT NULL,
      bank TEXT,
      issueDate TEXT NOT NULL,
      dueDate TEXT NOT NULL,
      status TEXT NOT NULL,
      note TEXT,
      notificationId TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_cheques_due_date ON cheques (dueDate);
    CREATE INDEX IF NOT EXISTS idx_cheques_issue_date ON cheques (issueDate);
    CREATE INDEX IF NOT EXISTS idx_cheques_amount ON cheques (amount);
    CREATE INDEX IF NOT EXISTS idx_cheques_status ON cheques (status);
    CREATE INDEX IF NOT EXISTS idx_cheques_beneficiary ON cheques (beneficiary);
    CREATE INDEX IF NOT EXISTS idx_cheques_cheque_number ON cheques (chequeNumber);
  `);
}

async function migrateLegacyChequeTableIfNeeded() {
  const db = await getDatabase();
  const columns = (await db.getAllAsync(`PRAGMA table_info(cheques)`)) as Array<Record<string, unknown>>;

  if (!columns.length) {
    await createChequeTable();
    return;
  }

  const idColumn = columns.find((column) => String(column.name) === 'id');
  const isLegacyTextId = String(idColumn?.type ?? '').toUpperCase() === 'TEXT';

  if (!isLegacyTextId) {
    return;
  }

  await db.execAsync(`
    ALTER TABLE cheques RENAME TO cheques_legacy;
    CREATE TABLE cheques (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      beneficiary TEXT NOT NULL,
      amount REAL NOT NULL,
      chequeNumber TEXT NOT NULL,
      bank TEXT,
      issueDate TEXT NOT NULL,
      dueDate TEXT NOT NULL,
      status TEXT NOT NULL,
      note TEXT,
      notificationId TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    INSERT INTO cheques (
      beneficiary, amount, chequeNumber, bank, issueDate, dueDate,
      status, note, notificationId, createdAt, updatedAt
    )
    SELECT
      beneficiary, amount, chequeNumber, bank, issueDate, dueDate,
      status, note, notificationId, createdAt, updatedAt
    FROM cheques_legacy
    ORDER BY datetime(createdAt) ASC;
    DROP TABLE cheques_legacy;
    CREATE INDEX IF NOT EXISTS idx_cheques_due_date ON cheques (dueDate);
    CREATE INDEX IF NOT EXISTS idx_cheques_issue_date ON cheques (issueDate);
    CREATE INDEX IF NOT EXISTS idx_cheques_amount ON cheques (amount);
    CREATE INDEX IF NOT EXISTS idx_cheques_status ON cheques (status);
    CREATE INDEX IF NOT EXISTS idx_cheques_beneficiary ON cheques (beneficiary);
    CREATE INDEX IF NOT EXISTS idx_cheques_cheque_number ON cheques (chequeNumber);
  `);
}

export async function initializeDatabase() {
  const db = await getDatabase();
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await migrateLegacyChequeTableIfNeeded();
}
