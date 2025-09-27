import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).setHeader('Allow', 'POST').json({ message: 'Method Not Allowed' });
  }

  try {
    // 1. SECURITY: Verify the callback token from Xendit
    const xenditCallbackToken = req.headers['x-callback-token'];
    if (xenditCallbackToken !== process.env.XENDIT_CALLBACK_TOKEN) {
      console.warn('Invalid Xendit callback token received.');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // 2. Get the data from the webhook payload
    const payload = req.body;
    console.log('Xendit Webhook Payload Received:', payload);

    // 3. Check if this is a successful payment event
    if (payload.status === 'PAID') {
      const orderId = payload.external_id;

      const client = await clientPromise;
      const db = client.db('paymentDB');
      
      // 4. Find the order in our database and update its status
      await db.collection('orders').updateOne(
        { _id: new ObjectId(orderId) },
        { 
          $set: { 
            status: 'PAID', // Set status to PAID (LUNAS)
            updatedAt: new Date() 
          } 
        }
      );
      console.log(`Order ${orderId} status updated to PAID.`);
    }

    // 5. IMPORTANT: Respond to Xendit with a 200 OK
    res.status(200).json({ message: 'Webhook received successfully' });

  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}