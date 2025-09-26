import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';
import { Order, OrderItem } from '@/types';
import { CartItem } from '@/context/CartContext';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { cartItems, shippingAddress }: { cartItems: CartItem[], shippingAddress: string } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const client = await clientPromise;
    const db = client.db('paymentDB');
    const productsCollection = db.collection('products');

    // --- SECURITY: Server-Side Price Calculation ---
    // Fetch the real prices from the database to prevent client-side manipulation.
    const productIds = cartItems.map(item => new ObjectId(item._id));
    const productsFromDB = await productsCollection.find({ _id: { $in: productIds } }).toArray();

    const priceMap = new Map(productsFromDB.map(p => [p._id.toString(), p.price]));

    let totalAmount = 0;
    const orderItems: OrderItem[] = cartItems.map(item => {
      const price = priceMap.get(item._id);
      if (price === undefined) {
        throw new Error(`Product with ID ${item._id} not found.`);
      }
      totalAmount += price * item.quantity;
      return {
        productId: item._id,
        name: item.name,
        price: price, // Use the price from the database
        quantity: item.quantity,
      };
    });
    
    // You can add shipping/tax calculation here if needed
    const shipping = 15000;
    totalAmount += shipping;

    // Create the new order document
    const newOrder: Omit<Order, '_id'> = {
      items: orderItems,
      totalAmount: totalAmount,
      shippingAddress: shippingAddress,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const ordersCollection = db.collection('orders');
    const result = await ordersCollection.insertOne(newOrder);

    // Respond with the ID of the newly created order
    res.status(201).json({ orderId: result.insertedId.toString() });

  } catch (error) {
    console.error('Failed to create order:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}