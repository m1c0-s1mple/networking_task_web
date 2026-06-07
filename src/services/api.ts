import { Customer, Product, Order } from '../types';

export async function fetchCustomers(): Promise<Customer[]> {
  const res = await fetch('/api/customers');
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to fetch customer directories.');
  }
  return res.json();
}

export async function createCustomer(data: {
  companyName: string;
  contactPerson: string;
  email: string;
  phone?: string;
}): Promise<Customer> {
  const res = await fetch('/api/customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create corporate customer profile.');
  }
  return res.json();
}

export async function deleteCustomer(id: string): Promise<void> {
  const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to de-authorize corporate customer.');
  }
}

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch('/api/products');
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to fetch catalogue products list.');
  }
  return res.json();
}

export async function createProduct(data: {
  name: string;
  sku: string;
  price: number;
  quantity: number;
}): Promise<Product> {
  const res = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to catalog product SKU.');
  }
  return res.json();
}

export async function adjustProductStock(productId: string, delta: number): Promise<Product> {
  const res = await fetch(`/api/products/${productId}/adjust`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ delta }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to adjust warehouse stock bins.');
  }
  return res.json();
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to delete product from catalogue.');
  }
}

export async function fetchOrders(): Promise<Order[]> {
  const res = await fetch('/api/orders');
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to restore active sales tickets.');
  }
  return res.json();
}

export async function placeOrder(data: {
  customerId: string;
  draftItems: { productId: string; quantity: number }[];
}): Promise<Order> {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to process corporate sale reservation.');
  }
  return res.json();
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
  const res = await fetch(`/api/orders/${orderId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to adjust sale ticket status.');
  }
  return res.json();
}
