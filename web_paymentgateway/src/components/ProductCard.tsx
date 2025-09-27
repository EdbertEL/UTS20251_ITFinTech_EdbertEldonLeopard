import Image from 'next/image';
import { Product } from '../types';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { cartItems, addToCart, updateQuantity } = useCart();
  const itemInCart = cartItems.find((item) => item.id === product.id);

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

      <div className="ml-auto">
        {itemInCart ? (
          <div className="flex items-center justify-end space-x-3">
            <button 
              onClick={() => updateQuantity(product._id, itemInCart.quantity - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-lg font-bold text-gray-600 transition-colors hover:bg-gray-100"
            >
              -
            </button>
            <span className="w-4 text-center font-semibold text-gray-700">{itemInCart.quantity}</span>
            <button 
              onClick={() => updateQuantity(product._id, itemInCart.quantity + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-lg font-bold text-gray-600 transition-colors hover:bg-gray-100"
            >
              +
            </button>
          </div>
        ) : (
          // If item is not in cart, show the "Add +" button
          <button 
            onClick={() => addToCart(product)} 
            className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-100"
          >
            Add +
          </button>
        )}
      </div>
    </div>
  );
}