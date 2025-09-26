import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white">
      
      <Image
        src="/edesign_logo.png"
        alt="Edesign Logo"
        width={150}
        height={150}
      />

      <h1 className="mt-6 text-4xl font-bold text-gray-800">
        Edesign
      </h1>

      <p className="mt-2 text-sm text-gray-500">
        Edbert Eldon Leopard (23502310006)
      </p>

      <Link href="/products" legacyBehavior>
        <a className="mt-8 flex items-center justify-center rounded-lg bg-gray-800 px-6 py-3 font-semibold text-white transition hover:bg-gray-600">
          Browse
          <span className="ml-2">&gt;</span> {/* Right arrow */}
        </a>
      </Link>

    </main>
  );
}