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