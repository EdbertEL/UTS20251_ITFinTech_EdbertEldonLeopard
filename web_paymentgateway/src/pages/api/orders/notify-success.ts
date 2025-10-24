import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import twilio from 'twilio';

// Initialize Twilio
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

    // Fetch the order to get the user ID
    const order = await db.collection('orders').findOne({ _id: new ObjectId(orderId) });
    if (!order || !order.userId) {
      return res.status(404).json({ message: 'Order or associated user not found.' });
    }

    // Fetch the user to get their name and phone number
    const user = await db.collection('users').findOne({ _id: new ObjectId(order.userId) });
    if (!user || !user.phoneNumber) {
      return res.status(404).json({ message: 'User phone number not found.' });
    }

    // Send the WhatsApp notification
    const messageBody = `🎉 Thank you, ${user.name}! Your payment for order #${orderId.substring(0, 8)} has been successfully processed. We will prepare your items for shipment shortly.`;
    
    await twilioClient.messages.create({
      body: messageBody,
      from: twilioWhatsAppNumber,
      to: `whatsapp:${user.phoneNumber}`,
    });

    console.log(`Payment confirmation sent to ${user.phoneNumber} for order ${orderId}`);
    res.status(200).json({ message: 'Notification sent successfully.' });

  } catch (error) {
    console.error('Failed to send success notification:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}