// src/pages/admin/products.tsx

import AdminLayout from '@/components/AdminLayout';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { Product, MongoProduct } from '@/types';
import clientPromise from '@/lib/mongodb'; // Make sure this is imported
import Link from 'next/link';
import { useRouter } from 'next/router';

const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

export default function ProductManagementPage({ products }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();

  const handleDelete = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const res = await fetch(`/api/admin/products/${productId}`, { method: 'DELETE' });
        if (res.ok) {
          // Refresh the page by reloading its server-side props
          router.replace(router.asPath);
        } else {
          const data = await res.json();
          alert(`Failed to delete product: ${data.message}`);
        }
      } catch (error) {
        alert('An error occurred while deleting the product.');
      }
    }
  };

  return (
    <AdminLayout pageTitle="Product Management">
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">All Products</h2>
          <Link href="/admin/products/new" legacyBehavior>
            <a className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Add New Product</a>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(product.price)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Link href={`/admin/products/${product._id}`} legacyBehavior>
                      <a className="text-indigo-600 hover:text-indigo-900">Edit</a>
                    </Link>
                    <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:text-red-900">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

// THIS IS THE CORRECTED getServerSideProps FOR THIS PAGE
export const getServerSideProps: GetServerSideProps<{ products: Product[] }> = async () => {
  try {
    // 1. Connect directly to the database on the server
    const client = await clientPromise;
    const db = client.db('paymentDB');
    const productsCollection = db.collection<MongoProduct>('products');

    // 2. Fetch the products directly
    const rawProducts = await productsCollection.find({}).sort({ name: 1 }).toArray();

    // 3. Transform the data for the client-side component
    const products: Product[] = rawProducts.map((product) => ({
      ...product,
      _id: product._id.toString(),
    }));

    return { props: { products } };
  } catch (error) {
    console.error("Admin products fetch error:", error);
    return { props: { products: [] } };
  }
};