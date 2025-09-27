import Link from 'next/link';
import { FiXCircle } from 'react-icons/fi';

export default function PaymentFailure() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <FiXCircle size={80} className="text-red-500" />
      <h1 className="mt-6 text-3xl font-bold text-gray-800">Payment Failed</h1>
      <p className="mt-4 text-lg text-gray-600">There was an issue processing your payment. Please try again.</p>
      
      <Link href="/checkout" legacyBehavior>
        <a className="mt-8 inline-block rounded-lg bg-gray-800 px-8 py-3 font-semibold text-white transition-colors hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2">
          Return to Checkout
        </a>
      </Link>
    </div>
  );
}