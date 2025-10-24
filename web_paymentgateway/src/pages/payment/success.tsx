import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiCheckCircle } from 'react-icons/fi';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { orderId } = router.query;

  // This effect runs once when the component mounts
  useEffect(() => {
    // Check if we have an orderId from the URL
    if (orderId && typeof orderId === 'string') {
      // "Fire and forget" the API call. We don't need to wait for it.
      // The user sees the success page immediately while the notification is sent in the background.
      fetch('/api/orders/notify-success', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      }).catch(error => {
        // Log any errors, but don't bother the user with them
        console.error("Failed to trigger success notification:", error);
      });
    }
  }, [orderId]); // The effect depends on orderId

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
        <FiCheckCircle className="mx-auto h-16 w-16 text-green-500" />
        <h1 className="mt-4 text-3xl font-bold text-gray-900">
          Payment Successful!
        </h1>
        <p className="mt-2 text-gray-600">
          Thank you for your purchase. A confirmation has been sent to your WhatsApp.
        </p>
        {orderId && (
          <p className="mt-2 text-sm text-gray-500">
            Order ID: {orderId}
          </p>
        )}
        <Link href="/products" legacyBehavior>
          <a className="mt-8 inline-block w-full rounded-md bg-indigo-600 px-5 py-3 text-white font-semibold shadow-sm hover:bg-indigo-700">
            Continue Shopping
          </a>
        </Link>
      </div>
    </div>
  );
}