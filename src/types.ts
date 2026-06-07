export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF';
}

export interface Customer {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number; // Current physical stock in warehouse
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string; 
  quantity: number;
  price: number; 
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  totalAmount: number;
  status: 'PENDING' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';
  orderItems: OrderItem[];
  createdAt: string;
}
