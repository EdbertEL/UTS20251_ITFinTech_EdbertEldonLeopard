// src/types.ts

import { ObjectId } from 'mongodb';

// --- PRODUCT TYPES ---
// (No changes needed here, this should already be correct)
export interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  imageUrl: string;
}

export interface MongoProduct extends Omit<Product, '_id'> {
  _id: ObjectId;
}


// --- ORDER TYPES (CORRECTED) ---
// This represents an item within an order
export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

// This is the type for your component props (client-side)
export interface Order {
  _id: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  totalAmount: number;
  shippingAddress: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'SHIPPED';
  createdAt: string; // Will be an ISO date string
  updatedAt: string; // Will be an ISO date string
  xenditInvoiceId?: string;
}

// This represents the raw data from the MongoDB 'orders' collection
// This is now simplified to match your actual data structure
export interface MongoOrder extends Omit<Order, '_id' | 'createdAt' | 'updatedAt'> {
  _id: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}