import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';
import twilio from 'twilio';

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;

// Helper to generate a random 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { email, password } = req.body;

    const client = await clientPromise;
    const db = client.db('paymentDB');
    const usersCollection = db.collection('users');

    // Find user and check password (plaintext as requested)
    const user = await usersCollection.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (!user.phoneNumber) {
      return res.status(400).json({ message: 'No phone number associated with this account.' });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP is valid for 10 minutes

    // Save OTP and expiry to the user's document in the database
    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { otp, otpExpiry } }
    );

    // Send the WhatsApp message via Twilio
    await twilioClient.messages.create({
      body: `Your Edesign login OTP is: ${otp}`,
      from: twilioWhatsAppNumber,
      to: `whatsapp:${user.phoneNumber}`,
    });

    res.status(200).json({ message: 'OTP sent successfully.' });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Failed to send OTP.' });
  }
}