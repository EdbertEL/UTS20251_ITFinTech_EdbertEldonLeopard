import Link from 'next/link';
import { FiCheckCircle } from 'react-icons/fi';

export default function PaymentSuccess() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <FiCheckCircle size={80} className="text-green-500" />
      <h1 className="mt-6 text-3xl font-bold text-gray-800">Payment Successful!</h1>
      <p className="mt-4 text-lg text-gray-600">Thank you for your order.</p>
      
      <Link href="/products" legacyBehavior>
        <a className="mt-8 inline-block rounded-lg bg-gray-800 px-8 py-3 font-semibold text-white transition-colors hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2">
          Return to Shop
        </a>
      </Link>
    </div>
  );
}