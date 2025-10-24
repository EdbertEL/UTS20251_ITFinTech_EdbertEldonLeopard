import Image from 'next/image';
import { Product } from '../types';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext'; // 1. Import the authentication hook
import { useRouter } from 'next/router';     // 2. Import the router for redirection

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { cartItems, addToCart, updateQuantity } = useCart();
  const { user } = useAuth(); // 3. Get the current user from the context
  const router = useRouter();   // 4. Get the router instance
  
  const itemInCart = cartItems.find((item) => item._id === product._id);
  
  // 5. Create a single handler to protect all cart actions
  const handleCartAction = (action: () => void) => {
    if (!user) {
      alert('You must be logged in to add items to your cart.');
      router.push('/'); // Redirect to the login page (your index)
      return;
    }
    // If the user is logged in, perform the requested action
    action();
  };

  return (
    <div className="flex items-center space-x-4 rounded-lg border border-gray-200 p-4">
      <Image 
        src={product.imageUrl} 
        alt={product.name} 
        width={80} 
        height={80}
        className="rounded-md object-cover" // Added object-cover for better image scaling
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
            {/* 6. Wrap the updateQuantity call in the protected handler */}
            <button 
              onClick={() => handleCartAction(() => updateQuantity(product._id, itemInCart.quantity - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-lg font-bold text-gray-600 transition-colors hover:bg-gray-100"
            >
              -
            </button>
            <span className="w-4 text-center font-semibold text-gray-700">{itemInCart.quantity}</span>
            {/* 7. Wrap the updateQuantity call in the protected handler */}
            <button 
              onClick={() => handleCartAction(() => updateQuantity(product._id, itemInCart.quantity + 1))}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-lg font-bold text-gray-600 transition-colors hover:bg-gray-100"
            >
              +
            </button>
          </div>
        ) : (
          // 8. Wrap the addToCart call in the protected handler
          <button 
            onClick={() => handleCartAction(() => addToCart(product))} 
            className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-100"
          >
            Add +
          </button>
        )}
      </div>
    </div>
  );
}