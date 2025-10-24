import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import axios from 'axios';
import twilio from 'twilio'; 

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    const client = await clientPromise;
    const db = client.db('paymentDB');
    
    // Fetch the order from our database
    const order = await db.collection('orders').findOne({ _id: new ObjectId(orderId) });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // 3. Fetch the customer's details using the userId from the order
    const user = await db.collection('users').findOne({ _id: new ObjectId(order.userId) });

    // Prepare the data for Xendit's Create Invoice API (no changes here)
    const xenditPayload = {
      external_id: order._id.toString(),
      amount: order.totalAmount,
      currency: 'IDR',
      description: `Payment for Order #${order._id.toString().substring(0, 8)}...`,
      success_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/success?orderId=${orderId}`,
      failure_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/failure?orderId=${orderId}`,
    };

    // Make the API call to Xendit (no changes here)
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
    
        if (user && user.phoneNumber && twilioWhatsAppNumber) {
      const messageBody = `Hi ${user.name}, your order #${order._id.toString().substring(0, 8)} is ready for payment. Total: Rp ${order.totalAmount.toLocaleString('id-ID')}.\n\nPlease complete your payment here: ${invoice_url}`;
      
      try {
        await twilioClient.messages.create({
          body: messageBody,
          from: twilioWhatsAppNumber,
          to: `whatsapp:${user.phoneNumber}`,
        });
        console.log(`WhatsApp notification sent to ${user.phoneNumber}`);
      } catch (waError) {
        // Log the error but don't stop the process. The user can still pay.
        console.error("Failed to send WhatsApp notification:", waError);
      }
    } else {
        console.warn("Could not send WhatsApp notification: User or phone number not found.");
    }
    
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