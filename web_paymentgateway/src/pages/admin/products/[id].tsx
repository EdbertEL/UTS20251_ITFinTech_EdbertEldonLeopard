import { useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import clientPromise from '@/lib/mongodb';
import { Product, MongoProduct } from '@/types';
import { ObjectId } from 'mongodb';

export default function ProductFormPage({ product }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const { id } = router.query;
  const isNewProduct = id === 'new';

  const [formData, setFormData] = useState({
    name: product?.name || '',
    category: product?.category || 'Services',
    price: product?.price || 0,
    description: product?.description || '',
    imageUrl: product?.imageUrl || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = isNewProduct ? '/api/admin/products' : `/api/admin/products/${id}`;
    const method = isNewProduct ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert(`Product ${isNewProduct ? 'created' : 'updated'} successfully!`);
        router.push('/admin/products');
      } else {
        const data = await res.json();
        throw new Error(data.message || 'Failed to save product');
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('An unknown error occurred.');
      }
    }
  };

  return (
    <AdminLayout pageTitle={isNewProduct ? 'Add New Product' : 'Edit Product'}>
      <div className="p-6 bg-white rounded-lg shadow max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-900">Product Name</label>
            <input 
              type="text" name="name" id="name" required value={formData.name} onChange={handleChange} 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-500 placeholder:text-gray-400" 
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-900">Category</label>
            <select 
              name="category" id="category" required value={formData.category} onChange={handleChange} 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-500"
            >
              <option>Services</option>
              <option>Digital Products</option>
              <option>Consulting</option>
            </select>
          </div>
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-900">Price (IDR)</label>
            <input 
              type="number" name="price" id="price" required value={formData.price} onChange={handleChange} 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-500 placeholder:text-gray-400" 
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-900">Description</label>
            <textarea 
              name="description" id="description" rows={4} required value={formData.description} onChange={handleChange} 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-500 placeholder:text-gray-400"
            ></textarea>
          </div>
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-900">Image URL</label>
            <input 
              type="text" name="imageUrl" id="imageUrl" required value={formData.imageUrl} onChange={handleChange} 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-500 placeholder:text-gray-400" 
            />
          </div>
          <div className="flex justify-end gap-4">
            <button type="button" onClick={() => router.push('/admin/products')} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Save Product</button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;

  if (id === 'new') {
    return { props: { product: null } };
  }

  try {
    const client = await clientPromise;
    const db = client.db('paymentDB');
    const productsCollection = db.collection<MongoProduct>('products');
    const rawProduct = await productsCollection.findOne({ _id: new ObjectId(id as string) });

    if (!rawProduct) {
      return { notFound: true };
    }

    const product = {
      ...rawProduct,
      _id: rawProduct._id.toString(),
    };

    return { props: { product } };
  } catch (error) {
    console.error(error);
    return { notFound: true };
  }
};