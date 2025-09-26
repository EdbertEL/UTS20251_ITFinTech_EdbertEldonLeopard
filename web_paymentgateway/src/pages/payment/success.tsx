import Link from 'next/link';
export default function PaymentSuccess() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-green-500">Payment Successful!</h1>
      <p className="mt-4">Thank you for your order.</p>
      <Link href="/products" legacyBehavior><a className="mt-8 text-blue-500">Return to Shop</a></Link>
    </div>
  );
}