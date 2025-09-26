import Link from 'next/link';

export default function CheckoutPage() {
  return (
    <div className="p-4">
      <Link href="/products" legacyBehavior>
        <a className="text-blue-500">&larr; Back</a>
      </Link>
      <h1 className="mt-4 text-3xl font-bold">Checkout</h1>
      <p className="mt-2">This is where the selected items will be displayed.</p>
      {/* We will build the UI based on the wireframe here later */}
    </div>
  );
}