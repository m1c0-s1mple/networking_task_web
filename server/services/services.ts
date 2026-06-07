import { CustomerRepository, ProductRepository, OrderRepository } from '../repositories/repositories';
import { Customer, Product, Order, OrderItem } from '../../src/types';

const customerRepo = new CustomerRepository();
const productRepo = new ProductRepository();
const orderRepo = new OrderRepository();

export class CustomerService {
  async list(): Promise<Customer[]> {
    return customerRepo.getAll();
  }

  async create(companyName: string, contactPerson: string, email: string, phone?: string): Promise<Customer> {
    if (!companyName.trim() || !contactPerson.trim() || !email.trim()) {
      throw new Error('Name, contact person, and email fields are required.');
    }

    const customer: Customer = {
      id: `cust-${Date.now()}`,
      companyName: companyName.trim(),
      contactPerson: contactPerson.trim(),
      email: email.trim(),
      phone: phone?.trim() || '+998 90 XXX XX XX',
      createdAt: new Date().toISOString()
    };

    return customerRepo.add(customer);
  }

  async delete(id: string): Promise<boolean> {
    return customerRepo.delete(id);
  }
}

export class ProductService {
  async list(): Promise<Product[]> {
    return productRepo.getAll();
  }

  async create(name: string, sku: string, price: number, quantity: number): Promise<Product> {
    if (!name.trim() || !sku.trim() || price <= 0) {
      throw new Error('Valid name, SKU code, and positive price are required.');
    }

    const product: Product = {
      id: `prod-${Date.now()}`,
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      price,
      quantity: Math.max(0, quantity)
    };

    return productRepo.add(product);
  }

  async adjustStock(productId: string, delta: number): Promise<Product> {
    const pr = await productRepo.getById(productId);
    if (!pr) {
      throw new Error('Target catalog SKU code not found.');
    }

    pr.quantity = Math.max(0, pr.quantity + delta);
    return productRepo.update(pr);
  }

  async delete(id: string): Promise<boolean> {
    return productRepo.delete(id);
  }
}

export class OrderService {
  async list(): Promise<Order[]> {
    return orderRepo.getAll();
  }

  async placeOrder(customerId: string, draftItems: { productId: string; quantity: number }[]): Promise<Order> {
    if (!customerId) {
      throw new Error('A target client must be selected.');
    }
    if (!draftItems || draftItems.length === 0) {
      throw new Error('Your shopping list draft is empty.');
    }

    const client = await customerRepo.getById(customerId);
    if (!client) {
      throw new Error('Corporate client profile not found.');
    }

    const allProducts = await productRepo.getAll();
    const modifiedProducts: Product[] = [];
    const mappedItems: OrderItem[] = [];
    const orderId = `ord-${Date.now().toString().slice(-4)}`;

    for (let i = 0; i < draftItems.length; i++) {
      const draft = draftItems[i];
      const pr = allProducts.find(p => p.id === draft.productId);
      if (!pr) {
        throw new Error(`Product with ID ${draft.productId} does not exist in the catalog.`);
      }

      if (pr.quantity < draft.quantity) {
        throw new Error(`Limit stock exceeded for SKU: ${pr.sku}. Requested: ${draft.quantity}, Operational Stock: ${pr.quantity}`);
      }

      // Deduct quantity
      pr.quantity -= draft.quantity;
      modifiedProducts.push(pr);

      mappedItems.push({
        id: `ord-item-${Date.now()}-${i}`,
        orderId,
        productId: pr.id,
        productName: pr.name,
        quantity: draft.quantity,
        price: pr.price
      });
    }

    // Update all products in the database
    for (const pr of modifiedProducts) {
      await productRepo.update(pr);
    }

    const totalAmount = parseFloat(mappedItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0).toFixed(2));

    const order: Order = {
      id: orderId,
      customerId,
      customerName: client.companyName,
      totalAmount,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      orderItems: mappedItems
    };

    return orderRepo.add(order);
  }

  async updateStatus(orderId: string, newStatus: Order['status']): Promise<Order> {
    const order = await orderRepo.getById(orderId);
    if (!order) {
      throw new Error('Target sales ticket was not found.');
    }

    if (order.status === newStatus) {
      return order;
    }

    // Refund stock to inventory if the order is CANCELLED and was not previously CANCELLED
    if (newStatus === 'CANCELLED' && order.status !== 'CANCELLED') {
      for (const item of order.orderItems) {
        const pr = await productRepo.getById(item.productId);
        if (pr) {
          pr.quantity += item.quantity;
          await productRepo.update(pr);
        }
      }
    }

    order.status = newStatus;
    return orderRepo.update(order);
  }
}
