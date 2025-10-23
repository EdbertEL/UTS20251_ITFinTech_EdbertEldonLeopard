import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const client = await clientPromise;
  const db = client.db('paymentDB');
  const productsCollection = db.collection('products');

  switch (req.method) {
    // GET all products for the admin list
    case 'GET':
      try {
        const products = await productsCollection.find({}).sort({ name: 1 }).toArray();
        res.status(200).json(products);
      } catch (error) {
        res.status(500).json({ message: 'Failed to fetch products' });
      }
      break;

    // POST a new product from the admin form
    case 'POST':
      try {
        const newProductData = req.body;
        // Ensure price from the form is stored as a number
        newProductData.price = parseFloat(newProductData.price);
        
        const result = await productsCollection.insertOne(newProductData);
        res.status(201).json({ message: 'Product created', productId: result.insertedId });
      } catch (error) {
        console.error("Admin Create Product API Error:", error);
        res.status(500).json({ message: 'Failed to create product' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}