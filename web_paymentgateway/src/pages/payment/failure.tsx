import Link from 'next/link';
export default function PaymentFailure() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-red-500">Payment Failed</h1>
      <p className="mt-4">There was an issue with your payment. Please try again.</p>
      <Link href="/checkout" legacyBehavior><a className="mt-8 text-blue-500">Return to Checkout</a></Link>
    </div>
  );
}