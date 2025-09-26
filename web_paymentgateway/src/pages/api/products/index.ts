import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const client = await clientPromise;
      const db = client.db("paymentDB");

      const products = await db
        .collection("products")
        .find({})
        .toArray();

      console.log("API ROUTE: Found products in DB:", products);

      res.status(200).json(products);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Unable to fetch products" });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}