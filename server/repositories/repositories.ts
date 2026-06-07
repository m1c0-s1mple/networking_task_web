import { DbStore } from './dbStore';
import { Customer, Product, Order } from '../../src/types';

export class CustomerRepository {
  async getAll(): Promise<Customer[]> {
    const db = await DbStore.read();
    return db.customers;
  }

  async getById(id: string): Promise<Customer | undefined> {
    const db = await DbStore.read();
    return db.customers.find(c => c.id === id);
  }

  async add(customer: Customer): Promise<Customer> {
    const db = await DbStore.read();
    db.customers.push(customer);
    await DbStore.write(db);
    return customer;
  }

  async delete(id: string): Promise<boolean> {
    const db = await DbStore.read();
    const originalLength = db.customers.length;
    db.customers = db.customers.filter(c => c.id !== id);
    if (db.customers.length < originalLength) {
      await DbStore.write(db);
      return true;
    }
    return false;
  }
}

export class ProductRepository {
  async getAll(): Promise<Product[]> {
    const db = await DbStore.read();
    return db.products;
  }

  async getById(id: string): Promise<Product | undefined> {
    const db = await DbStore.read();
    return db.products.find(p => p.id === id);
  }

  async add(product: Product): Promise<Product> {
    const db = await DbStore.read();
    db.products.push(product);
    await DbStore.write(db);
    return product;
  }

  async update(product: Product): Promise<Product> {
    const db = await DbStore.read();
    db.products = db.products.map(p => p.id === product.id ? product : p);
    await DbStore.write(db);
    return product;
  }

  async delete(id: string): Promise<boolean> {
    const db = await DbStore.read();
    const originalLength = db.products.length;
    db.products = db.products.filter(p => p.id !== id);
    if (db.products.length < originalLength) {
      await DbStore.write(db);
      return true;
    }
    return false;
  }
}

export class OrderRepository {
  async getAll(): Promise<Order[]> {
    const db = await DbStore.read();
    return db.orders;
  }

  async getById(id: string): Promise<Order | undefined> {
    const db = await DbStore.read();
    return db.orders.find(o => o.id === id);
  }

  async add(order: Order): Promise<Order> {
    const db = await DbStore.read();
    db.orders.unshift(order); // Newest orders at the top
    await DbStore.write(db);
    return order;
  }

  async update(order: Order): Promise<Order> {
    const db = await DbStore.read();
    db.orders = db.orders.map(o => o.id === order.id ? order : o);
    await DbStore.write(db);
    return order;
  }
}
