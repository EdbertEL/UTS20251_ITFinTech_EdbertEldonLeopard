import { useRouter } from 'next/router';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { FiChevronLeft } from 'react-icons/fi';

// A simple header component specific to this page
function PaymentHeader() {
  return (
    <header className="flex items-center border-b p-4">
      <Link href="/checkout" legacyBehavior>
        <a className="p-2">
          <FiChevronLeft size={24} className="text-gray-500" />
        </a>
      </Link>
      <h1 className="flex-1 text-center text-xl font-bold">Secure Checkout</h1>
      <div className="w-8"></div> {/* Spacer for centering */}
    </header>
  );
}

export default function PaymentPage() {
  const router = useRouter();
  const { orderId } = router.query;
  const { cartItems } = useCart();

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [shippingAddress, setShippingAddress] = useState(
    'Edbert Eldon Leopard\nJl. Prasetiya Mulya No. 1, Jakarta, 12345'
  );

  // State to manage which payment method is selected
  const [selectedMethod, setSelectedMethod] = useState('credit-card');

  // --- Calculations ---
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 15000; // Example: Flat shipping fee
  const tax = subtotal * 0.10; // Example: 10% tax
  const total = subtotal + shipping + tax;

  // This function will be called when the user clicks "Confirm & Pay"
  // For now, it's a placeholder. Later, this will trigger the API call to Xendit.
  const handlePayment = () => {
    console.log('Initiating payment for:', {
      orderId,
      total,
      paymentMethod: selectedMethod,
      shippingAddress, // Now we can send the updated address
      items: cartItems,
    });
    alert('Redirecting to payment gateway...');
  };

  return (
    <div>
      <PaymentHeader />
      <main className="space-y-8 p-4">
        {/* Shipping Address Section */}
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Shipping Address</h2>
            <button 
              onClick={() => setIsEditingAddress(!isEditingAddress)} 
              className="text-sm font-semibold text-blue-500 hover:underline"
            >
              {isEditingAddress ? 'Save' : 'Edit'}
            </button>
          </div>
          <div className="mt-2">
            {isEditingAddress ? (
              <textarea
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-4"
                rows={3}
              />
            ) : (
              <div className="rounded-lg border p-4 text-gray-600 whitespace-pre-line">
                {shippingAddress}
              </div>
            )}
          </div>
        </section>

        {/* Payment Method Section */}
        <section>
          <h2 className="text-lg font-semibold">Payment Method</h2>
          <div className="mt-2 space-y-3 m-4">
            {['Credit/Debit Card', 'PayPal', 'Other (e.g. E-Wallet, Bank Transfer)'].map((method) => (
              <label key={method} className="flex cursor-pointer items-center">
                <input
                  type="radio"
                  name="payment-method"
                  value={method}
                  checked={selectedMethod === method}
                  onChange={() => setSelectedMethod(method)}
                  className="h-4 w-4 text-gray-800 focus:ring-gray-600"
                />
                <span className="ml-3 font-medium">{method}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Order Summary Section */}
        <section>
          <h2 className="text-lg font-semibold">Order Summary</h2>
          <div className="mt-2 space-y-2 rounded-lg border p-4">
            <div className="flex justify-between">
              <span>Item(s) Total</span>
              <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(shipping)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(total)}</span>
            </div>
          </div>
        </section>

        {/* Confirm and Pay Button */}
        <button
          onClick={handlePayment}
          className="w-full rounded-lg p-4 bg-gray-800 text-center font-semibold text-white hover:bg-gray-700"
        >
          Confirm & Pay
        </button>
      </main>
    </div>
  );
}