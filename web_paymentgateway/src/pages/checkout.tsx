import Link from "next/link";
import Image from "next/image";
import { useCart, CartItem } from "@/context/CartContext";
import { FiChevronLeft } from "react-icons/fi";
import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from '@/context/AuthContext';

// Header component remains the same
function CheckoutHeader() {
  return (
    <header className="flex items-center justify-between border-b p-4">
      <Link href="/products" legacyBehavior>
        <a className="p-2">
          <FiChevronLeft size={24} className="text-gray-500" />
        </a>
      </Link>
      <h1 className="text-xl font-bold">Checkout</h1>
      <div className="w-8"></div>
    </header>
  );
}

export default function CheckoutPage() {
  const { user } = useAuth(); // Get the logged-in user from the context
  const { cartItems, updateQuantity } = useCart();
  const router = useRouter();

  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  // --- THIS IS THE UPDATED FUNCTION ---
  const handleCreateOrder = async () => {
    // 1. Check if the user is logged in before proceeding
    if (!user) {
      alert("You must be logged in to place an order.");
      router.push('/'); // Redirect to the login page
      return;
    }

    setIsCreatingOrder(true);
    try {
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // 2. Add userId and customerName to the request body
        body: JSON.stringify({
          cartItems,
          shippingAddress: "Edu Town Kavling Edu I No. 1, Jalan BSD Raya Barat 1, Pagedangan, Kabupaten Tangerang, Banten 15339",
          userId: user._id,
          customerName: user.name,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create order");
      }

      const { orderId } = await response.json();
      router.push(`/payment/${orderId}`);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        alert(`Could not create order: ${error.message}`);
      } else {
        alert("Could not create order. Please try again.");
      }
      setIsCreatingOrder(false);
    }
  };

  // The rest of your component's JSX remains the same
  const subtotal = cartItems.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <div>
      <CheckoutHeader />
      <main className="p-4">
        {cartItems.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-600">Your cart is empty.</p>
            <Link href="/products" legacyBehavior>
                <a className="mt-4 inline-block rounded-md bg-indigo-600 px-5 py-2 text-white hover:bg-indigo-700">
                    Continue Shopping
                </a>
            </Link>
          </div>
        ) : (
          <>
            {/* Cart Items List */}
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item._id} className="flex items-center space-x-4">
                  <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="rounded-md" />
                  <div className="flex-1">
                    <p className="font-semibold">{item.name}</p>
                    <div className="mt-1 flex items-center space-x-3">
                      <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-lg font-bold text-gray-600 transition-colors hover:bg-gray-100">-</button>
                      <span className="w-4 text-center font-semibold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-lg font-bold text-gray-600 transition-colors hover:bg-gray-100">+</button>
                    </div>
                  </div>
                  <p className="font-semibold">
                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            {/* Totals Section */}
            <div className="mt-8 border-t pt-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (10%)</span>
                  <span>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(tax)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(total)}</span>
                </div>
              </div>

              <button
                onClick={handleCreateOrder}
                disabled={isCreatingOrder}
                className="mt-6 block w-full rounded-lg bg-gray-800 p-4 text-center font-semibold text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {isCreatingOrder ? "Processing..." : "Continue to Payment →"}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}