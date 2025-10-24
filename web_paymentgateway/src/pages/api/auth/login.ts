import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { email, password } = req.body;

    const client = await clientPromise;
    const db = client.db('paymentDB');
    const usersCollection = db.collection('users');

    // Find user by email and (plaintext) password
    const user = await usersCollection.findOne({ email, password });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Don't send the password back to the client, even if it's not hashed.
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({ message: 'Login successful', user: userWithoutPassword });

  } catch (error) {
    console.error('Login API error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}