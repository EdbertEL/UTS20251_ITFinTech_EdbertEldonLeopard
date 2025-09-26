// src/pages/payment/[orderId].tsx
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function PaymentPage() {
  const router = useRouter();
  const { orderId } = router.query; // This gets the 'orderId' from the URL

  return (
    <div className="p-4">
      <Link href="/checkout" legacyBehavior>
        <a className="text-blue-500">&larr; Back to Checkout</a>
      </Link>
      <h1 className="mt-4 text-3xl font-bold">Secure Payment</h1>
      <p className="mt-2">Completing payment for Order ID: <strong>{orderId}</strong></p>
      {/* The payment UI will be built here */}
    </div>
  );
}