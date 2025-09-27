export interface Product {
    id: number;
    name: string;
    price: number;
    description: string;
    category: string;
    imageUrl: string;
    _id: string;
}

// This represents the raw product data from the DATABASE
export interface MongoProduct extends Omit<Product, '_id'> {
  _id: object; // _id is an object (ObjectId)
}

export interface OrderItem {
  productId: string;
  name: string; // Product name for historical purposes
  price: number; // Store price at the time of purchase for historical accuracy
  quantity: number;
}

export interface Order {
  _id?: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  totalAmount: number;
  shippingAddress: string;
  status: 'PENDING' | 'PAID' | 'FAILED'; // The status of the payment
  createdAt: Date;
  updatedAt: Date;
  xenditInvoiceId?: string;
  paymentMethod?: string;
}