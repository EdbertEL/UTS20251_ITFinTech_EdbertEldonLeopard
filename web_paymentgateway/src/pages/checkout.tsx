import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { FiChevronLeft, FiPlus, FiMinus } from 'react-icons/fi';

// A simple header component specific to this page
function CheckoutHeader() {
  return (
    <header className="flex items-center justify-between border-b p-4">
      <Link href="/products" legacyBehavior>
        <a className="p-2">
          <FiChevronLeft size={24} className="text-gray-500" />
        </a>
      </Link>
      <h1 className="text-xl font-bold">Checkout</h1>
      <div className="w-8"></div> {/* Spacer to keep title centered */}
    </header>
  );
}

export default function CheckoutPage() {
  const { cartItems, updateQuantity } = useCart();

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.10; // Example: 10% tax
  const total = subtotal + tax;
  
  // A placeholder for our future real Order ID from the database
  const dummyOrderId = 'order-' + Math.random().toString(36).substr(2, 9);

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
            
            <Link href={`/payment/${dummyOrderId}`} legacyBehavior>
              <a className="mt-6 block w-full rounded-lg bg-gray-800 p-4 text-center font-semibold text-white hover:bg-gray-700">
                Continue to Payment &rarr;
              </a>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}