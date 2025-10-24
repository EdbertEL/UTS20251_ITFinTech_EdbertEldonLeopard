import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// We no longer need Twilio here
// import twilio from 'twilio';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).setHeader('Allow', 'POST').json({ message: 'Method Not Allowed' });
  }

  try {
    // ... (Your token verification logic remains the same)
    const xenditCallbackToken = req.headers['x-callback-token'];
    if (xenditCallbackToken !== process.env.XENDIT_CALLBACK_TOKEN) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const payload = req.body;
    console.log('Webhook received for external_id:', payload.external_id);

    if (payload.status === 'PAID') {
      const orderId = payload.external_id;

      const client = await clientPromise;
      const db = client.db('paymentDB');
      const ordersCollection = db.collection('orders');
      
      const updateResult = await ordersCollection.updateOne(
        { _id: new ObjectId(orderId) },
        { 
          $set: { 
            status: 'PAID',
            updatedAt: new Date() 
          } 
        }
      );
      
      if (updateResult.matchedCount === 0) {
        console.error(`Webhook Error: Order with ID ${orderId} not found.`);
        return res.status(404).json({ message: 'Order not found' });
      }

      console.log(`Order ${orderId} status updated to PAID.`);
    }

    res.status(200).json({ message: 'Webhook received successfully' });

  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}