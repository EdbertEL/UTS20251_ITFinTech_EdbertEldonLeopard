import Image from 'next/image';
import { Product } from '../types';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const { addToCart } = useCart(); 

    return (
    <div className="flex items-center space-x-4 rounded-lg border border-gray-200 p-4">
        <Image 
        src={product.imageUrl} 
        alt={product.name} 
        width={80} 
        height={80}
        className="rounded-md"
        />
        <div className="flex-1">
        <h3 className="font-semibold text-gray-800">{product.name}</h3>
        <p className="text-lg font-bold text-gray-900">
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(product.price)}
        </p>
        <p className="text-sm text-gray-500">{product.description}</p>
        </div>
        <button onClick={() => addToCart(product)} 
        className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-100">
        Add +
        </button>
    </div>
    );
}