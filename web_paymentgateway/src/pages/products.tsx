import Header from '@/components/header';
import ProductCard from '@/components/ProductCard';
import Sidebar from '@/components/sidebar';
import { FiSearch } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { MongoProduct, Product } from '@/types';

export default function ProductsPage({ products }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const categories = ['All', 'Drinks', 'Snacks', 'Bundles'];
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filteredProducts, setFilteredProducts] = useState(products);

  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(
        (product) => product.category === selectedCategory
      );
      setFilteredProducts(filtered);
    }
  }, [selectedCategory, products]);

//  STATE FOR SIDEBAR ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {isSidebarOpen && (
        <div className="fixed inset-0 z-10 bg-black opacity-50" onClick={toggleSidebar}></div>
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

        {/* Category Filters (this part is already interactive) */}
        <div className="mb-6 flex space-x-4 border-b">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`py-2 font-semibold hover:text-gray-900 ${
                selectedCategory === category
                  ? 'border-b-2 border-gray-900 text-gray-900'
                  : 'text-gray-500'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* 4. Product List now maps over the 'filteredProducts' state */}
        <div className="space-y-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </main>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<{ products: Product[] }> = async () => {
  // Fetch data from our own API endpoint
  const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL 
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` 
  : 'http://localhost:3000';

  const res = await fetch('http://localhost:3000/api/products');

  const rawProducts: MongoProduct[] = await res.json();

  console.log("getServerSideProps: Received raw products from API:", rawProducts);

  const products = rawProducts.map((product: MongoProduct) => ({
    ...product,
    _id: product._id.toString(),
  }));

  return { props: { products } };
};