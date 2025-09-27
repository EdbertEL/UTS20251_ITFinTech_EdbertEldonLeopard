import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { orderId } = req.query;

  // --- GET METHOD ---
  if (req.method === 'GET') {
    try {
      if (!orderId || typeof orderId !== 'string') {
        return res.status(400).json({ message: 'Invalid Order ID' });
      }
      const client = await clientPromise;
      const db = client.db('paymentDB');
      const order = await db.collection('orders').findOne({ _id: new ObjectId(orderId) });

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      res.status(200).json(order);
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } 
  // --- PATCH METHOD ---
  else if (req.method === 'PATCH') {
    try {
      if (!orderId || typeof orderId !== 'string') {
        return res.status(400).json({ message: 'Invalid Order ID' });
      }

      const { shippingAddress } = req.body;
      if (!shippingAddress) {
        return res.status(400).json({ message: 'Shipping address is required' });
      }

      const client = await clientPromise;
      const db = client.db('paymentDB');
      
      const result = await db.collection('orders').updateOne(
        { _id: new ObjectId(orderId) },
        { 
          $set: { 
            shippingAddress: shippingAddress,
            updatedAt: new Date()
          } 
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Order not found to update' });
      }

      res.status(200).json({ message: 'Address updated successfully' });
    } catch (error) {
      console.error('Failed to update address:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } 
  else {
    res.setHeader('Allow', ['GET', 'PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}