import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';
import { Order, OrderItem } from '@/types';
import { CartItem } from '@/context/CartContext';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // --- 1. GET USER INFO FROM REQUEST BODY ---
    const { cartItems, shippingAddress, userId, customerName }: { 
      cartItems: CartItem[], 
      shippingAddress: string,
      userId: string,
      customerName: string
    } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    // Add validation for user info
    if (!userId || !customerName) {
      return res.status(400).json({ message: 'User information is missing' });
    }

    const client = await clientPromise;
    const db = client.db('paymentDB');
    const productsCollection = db.collection('products');

    // (Server-side price calculation logic remains the same...)
    const productIds = cartItems.map(item => new ObjectId(item._id));
    const productsFromDB = await productsCollection.find({ _id: { $in: productIds } }).toArray();
    const priceMap = new Map(productsFromDB.map(p => [p._id.toString(), p.price]));
    let subtotal = 0;
    const orderItems: OrderItem[] = cartItems.map(item => {
      const price = priceMap.get(item._id);
      if (price === undefined) throw new Error(`Product with ID ${item._id} not found.`);
      subtotal += price * item.quantity;
      return { productId: item._id, name: item.name, price, quantity: item.quantity };
    });

    const tax = subtotal * 0.10;
    const shipping = 15000;
    const totalAmount = subtotal + tax + shipping;

    // --- 2. ADD USER INFO TO THE NEW ORDER DOCUMENT ---
    const newOrder: Omit<Order, '_id' | 'createdAt' | 'updatedAt'> & { createdAt?: Date, updatedAt?: Date } = {
      userId,
      customerName,
      items: orderItems,
      subtotal,
      tax,
      shipping,
      totalAmount,
      shippingAddress,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const ordersCollection = db.collection('orders');
    const result = await ordersCollection.insertOne(newOrder);

    res.status(201).json({ orderId: result.insertedId.toString() });

  } catch (error) {
    console.error('Failed to create order:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}