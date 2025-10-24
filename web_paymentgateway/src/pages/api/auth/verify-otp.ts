import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { email, otp } = req.body;

    const client = await clientPromise;
    const db = client.db('paymentDB');
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ email });

    // Check if user, OTP, and expiry are valid
    if (!user || !user.otp || !user.otpExpiry) {
      return res.status(400).json({ message: 'OTP not found or expired.' });
    }
    if (user.otp !== otp) {
      return res.status(401).json({ message: 'Invalid OTP.' });
    }
    if (new Date() > new Date(user.otpExpiry)) {
      return res.status(401).json({ message: 'OTP has expired.' });
    }

    // OTP is valid. Clear it from the database to prevent reuse.
    await usersCollection.updateOne(
      { _id: user._id },
      { $unset: { otp: "", otpExpiry: "" } }
    );
    
    // Don't send the password back to the client
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(200).json({ message: 'Login successful', user: userWithoutPassword });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Failed to verify OTP.' });
  }
}