import { useRouter } from 'next/router';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { FiChevronLeft } from 'react-icons/fi';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { Order } from '@/types';

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

export default function PaymentPage({ order }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const { orderId } = router.query;
  const { cartItems } = useCart();

  const [shippingAddress, setShippingAddress] = useState(order.shippingAddress);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false); // for loading state

  // --- Calculations ---
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 10000; // 10,000 IDR shipping fee datar
  const tax = subtotal * 0.10; // Semisal pajaknya 10%
  const total = subtotal + shipping + tax;

  const handleSaveAddress = async () => {
    // 1. Optimistic UI: Update the UI immediately for a fast user experience.
    setIsEditingAddress(false);

    try {
      // 2. Make the API call in the background.
      const response = await fetch(`/api/orders/${order._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shippingAddress }), // Send the new address from our state
      });

      if (!response.ok) {
        // If the API call fails, throw an error to be caught below.
        throw new Error('Failed to save address.');
      }
      
      // On success, do nothing, the UI is already updated.

    } catch (error) {
      // 3. Revert UI on failure: If the save fails, show an alert and revert the changes.
      console.error(error);
      alert('Failed to save address. Please try again.');
      setIsEditingAddress(true); // Go back to editing mode
      setShippingAddress(order.shippingAddress); // Revert to the original address
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create invoice');
      }

      const { invoiceUrl } = await response.json();

      // Redirect the user to the Xendit payment page
      window.location.href = invoiceUrl;

    } catch (error) {
      
      console.error(error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('An unexpected error occurred. Please try again.');
      }
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <PaymentHeader />
      <main className="space-y-8 p-4">
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Shipping Address</h2>
            {/* --- UPDATED BUTTON ONCLICK LOGIC --- */}
            <button
              onClick={isEditingAddress ? handleSaveAddress : () => setIsEditingAddress(true)}
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
              <div className="whitespace-pre-line rounded-lg border p-4 text-gray-600">
                {shippingAddress}
              </div>
            )}
          </div>
        </section>

        {/* Order Summary Section */}
        <section>
          <h2 className="text-lg font-semibold">Order Summary</h2>
          <div className="mt-2 space-y-2 rounded-lg border p-4">
            <div className="flex justify-between">
              <span>Item(s) Total (Subtotal)</span>
              <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (10%)</span>
              <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(order.tax)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(order.shipping)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 mt-2 font-bold text-lg">
              <span>Total</span>
              <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(order.totalAmount)}</span>
            </div>
          </div>
        </section>
        
        {/* Confirm and Pay Button */}
        <button
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full rounded-lg bg-gray-800 p-4 font-semibold text-white transition-colors hover:bg-gray-900 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {isProcessing ? 'Processing...' : 'Confirm & Pay'}
        </button>
      </main>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<{ order: Order }> = async (context) => {
  const { orderId } = context.params!;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/orders/${orderId}`);
  
  if (!res.ok) {
    return { notFound: true }; // Redirects to a 404 page if the order isn't found
  }

  const rawOrder = await res.json();
  
  // Convert all Date objects to string to avoid serialization errors
  const order = JSON.parse(JSON.stringify(rawOrder));

  return { props: { order } };
};