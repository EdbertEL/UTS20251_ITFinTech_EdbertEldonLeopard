import Header from '@/components/header'; // The '@/' alias points to the 'src' folder
import ProductCard from '@/components/ProductCard';
import Sidebar from '@/components/sidebar';
import { FiSearch } from 'react-icons/fi';
import { useState } from 'react';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { MongoProduct, Product } from '@/types';

export default function ProductsPage({ products }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const categories = ['All', 'Drinks', 'Snacks', 'Bundles'];
  const [selectedCategory, setSelectedCategory] = useState('All');
//  STATE FOR SIDEBAR ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-10 bg-black opacity-50" // Dark overlay
          onClick={toggleSidebar} // Clicking the overlay closes the sidebar
        ></div>
      )}

      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} /> 
      <Header onMenuClick={toggleSidebar} />
      
      <main className="p-4">
        {/* Search Bar */}
        <div className="relative mb-4 text-gray-500">
          <input
            type="text"
            placeholder="Search"
            className="w-full rounded-lg border border-gray-300 p-3 pl-10"
          />
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        {/* Category Filters */}
        <div className="mb-6 flex space-x-4 border-b">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`py-2 font-semibold hover:text-gray-900 ${
                selectedCategory === category
                  ? 'border-b-2 border-gray-900 text-gray-900' // Styles for the selected button
                  : 'text-gray-500' // Styles for inactive buttons
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        {/* Product List */}
        <div className="space-y-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>
    </div>
  );
}

// This function runs on the server before the page is rendered
export const getServerSideProps: GetServerSideProps<{ products: Product[] }> = async () => {
  // Fetch data from our own API endpoint
  const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL 
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` 
  : 'http://localhost:3000';

  const res = await fetch('http://localhost:3000/api/products');

  const rawProducts: MongoProduct[] = await res.json();

  console.log("getServerSideProps: Received raw products from API:", rawProducts);

  // MongoDB's default _id is an object. We need to convert it to a string
  // so it can be passed as a prop, and map it to our 'id' field.
  const products = rawProducts.map((product: MongoProduct) => ({
    ...product,
    _id: product._id.toString(), // Convert the MongoDB ObjectId object to a string
  }));

  return { props: { products } };
};