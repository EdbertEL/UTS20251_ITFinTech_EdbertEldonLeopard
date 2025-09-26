import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    // 1. Fetch the order from our database
    const client = await clientPromise;
    const db = client.db('paymentDB');
    const order = await db.collection('orders').findOne({ _id: new ObjectId(orderId) });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // 2. Prepare the data for Xendit's Create Invoice API
    const xenditPayload = {
      external_id: order._id.toString(), // CRUCIAL: Link Xendit invoice to our orderId
      amount: order.totalAmount,
      currency: 'IDR',
      description: `Payment for Order #${order._id.toString()}`,
      success_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/success`,
      failure_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/failure`,
    };

    // 3. Make the API call to Xendit
    const response = await axios.post('https://api.xendit.co/v2/invoices', xenditPayload, {
      headers: {
        'Authorization': `Basic ${process.env.XENDIT_API_KEY_BASE64}`,
        'Content-Type': 'application/json',
      },
    });

    const { invoice_url, id: xenditInvoiceId } = response.data;

    // (Optional but recommended) Update our order with the Xendit invoice ID
    await db.collection('orders').updateOne(
      { _id: order._id },
      { $set: { xenditInvoiceId: xenditInvoiceId } }
    );
    
    // 4. Send the invoice URL back to the frontend
    res.status(200).json({ invoiceUrl: invoice_url });

// Error handling with type checking
  } catch (error) { // The 'error' variable is of type 'unknown' by default
    
    let errorMessage = 'An unknown error occurred';
    if (axios.isAxiosError(error)) {
      console.error('Xendit API Error:', error.response?.data);
      errorMessage = error.response?.data?.message || 'Failed to connect to payment gateway';
    } else if (error instanceof Error) {
      console.error('General Error:', error.message);
      errorMessage = error.message;
    } else {
      console.error('Unexpected error type:', error);
    }

    res.status(500).json({ message: 'Internal Server Error', error: errorMessage });
  }
}