import fs from 'fs';
import path from 'path';
import { Customer, Product, Order } from '../../src/types';

export interface DbSchema {
  customers: Customer[];
  products: Product[];
  orders: Order[];
}

const dbDirectory = path.join(process.cwd(), 'server', 'data');
const dbPath = path.join(dbDirectory, 'db.json');

export class DbStore {
  private static cachedData: DbSchema | null = null;

  private static ensureDbExists() {
    if (!fs.existsSync(dbDirectory)) {
      fs.mkdirSync(dbDirectory, { recursive: true });
    }

    if (!fs.existsSync(dbPath)) {
      const initialData: DbSchema = { customers: [], products: [], orders: [] };
      fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2), 'utf-8');
    }
  }

  public static async read(): Promise<DbSchema> {
    this.ensureDbExists();
    try {
      const content = await fs.promises.readFile(dbPath, 'utf-8');
      this.cachedData = JSON.parse(content);
      return this.cachedData!;
    } catch (error) {
      console.error('Error reading internal JSON database:', error);
      return { customers: [], products: [], orders: [] };
    }
  }

  public static async write(data: DbSchema): Promise<void> {
    this.ensureDbExists();
    try {
      this.cachedData = data;
      await fs.promises.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error writing to internal JSON database:', error);
      throw new Error('Database write operation failed.');
    }
  }
}
