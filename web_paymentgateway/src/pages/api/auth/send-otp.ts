import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';

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

    // Find user and check password
    const user = await usersCollection.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (!user.phoneNumber) {
      return res.status(400).json({ message: 'No phone number associated with this account.' });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    // Save OTP to the user's document
    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { otp, otpExpiry } }
    );

    // --- FONNTE API CALL ---
    const fonnteToken = process.env.FONNTE_TOKEN;
    const fonnteTargetNumber = user.phoneNumber.replace('+', ''); // Fonnte usually doesn't need the '+'

    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': fonnteToken || '', // Get token from .env
      },
      body: JSON.stringify({
        target: fonnteTargetNumber,
        message: `Your Edesign login OTP is: ${otp}`,
      }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("Fonnte API Error:", errorData);
        throw new Error('Failed to send OTP via Fonnte.');
    }
    // --- END OF FONNTE CALL ---

    res.status(200).json({ message: 'OTP sent successfully.' });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Failed to send OTP.' });
  }
}