import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { FiChevronLeft, FiPlus, FiMinus } from 'react-icons/fi';
import { useState } from 'react';
import { useRouter } from 'next/router';

function CheckoutHeader() {
  return (
    <header className="flex items-center justify-between border-b p-4">
      <Link href="/products" legacyBehavior>
        <a className="p-2">
          <FiChevronLeft size={24} className="text-gray-500" />
        </a>
      </Link>
      <h1 className="text-xl font-bold">Checkout</h1>
      <div className="w-8"></div>
    </header>
  );
}

export default function CheckoutPage() {
  const { cartItems, updateQuantity } = useCart();
  const router = useRouter(); 

  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const handleCreateOrder = async () => {
    setIsCreatingOrder(true);
    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          cartItems, 
          shippingAddress: "Jl. Prasetiya Mulya No. 1, Jakarta, 12345"
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const { orderId } = await response.json();
      
      router.push(`/payment/${orderId}`);

    } catch (error) {
      console.error(error);
      alert('Could not create order. Please try again.');
      setIsCreatingOrder(false);
    }
  };

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.10; // Example: 10% tax
  const total = subtotal + tax;
  
  return (
    <div>
      <CheckoutHeader />
      <main className="p-4">
        {cartItems.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center space-x-4">
                <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="rounded-md" />
                <div className="flex-1">
                  <p className="font-semibold">{item.name}</p>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1"><FiMinus size={16}/></button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1"><FiPlus size={16}/></button>
                  </div>
                </div>
                <p className="font-semibold">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Totals Section */}
        {cartItems.length > 0 && (
          <div className="mt-8 border-t pt-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (10%)</span>
                <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(total)}</span>
              </div>
            </div>
            
            <button 
              onClick={handleCreateOrder}
              disabled={isCreatingOrder}
              className="mt-6 block w-full rounded-lg bg-gray-800 p-4 text-center font-semibold text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isCreatingOrder ? 'Processing...' : 'Continue to Payment →'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}