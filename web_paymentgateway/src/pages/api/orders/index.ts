import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';
import { Order } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Order[] | { message: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('paymentDB');
    const ordersCollection = db.collection<Order>('orders');

    // Fetch all orders, sorted by the most recent first
    const orders = await ordersCollection.find({}).sort({ createdAt: -1 }).toArray();

    res.status(200).json(orders);
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}