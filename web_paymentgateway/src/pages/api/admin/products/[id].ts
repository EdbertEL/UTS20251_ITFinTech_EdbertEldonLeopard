import type { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string' || !ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid product ID' });
  }

  const client = await clientPromise;
  const db = client.db('paymentDB');
  const productsCollection = db.collection('products');
  const query = { _id: new ObjectId(id) };

  switch (req.method) {
    // UPDATE a product
    case 'PUT':
      try {
        const updateData = req.body;
        if (updateData.price) {
          updateData.price = parseFloat(updateData.price);
        }
        
        const result = await productsCollection.updateOne(query, { $set: updateData });
        if (result.matchedCount === 0) {
          return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Product updated successfully' });
      } catch (error) {
        res.status(500).json({ message: 'Failed to update product' });
      }
      break;

    // DELETE a product
    case 'DELETE':
      try {
        const result = await productsCollection.deleteOne(query);
        if (result.deletedCount === 0) {
          return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Product deleted successfully' });
      } catch (error) {
        res.status(500).json({ message: 'Failed to delete product' });
      }
      break;

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}