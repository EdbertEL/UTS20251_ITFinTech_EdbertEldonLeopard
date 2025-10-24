import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext'; // Import auth context
import { FiMenu, FiShoppingCart, FiUser, FiLogOut } from 'react-icons/fi';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { cartItems } = useCart();
  const { user, logout } = useAuth(); // Get user and logout function
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    router.push('/'); // Redirect to login page after logout
  };

  return (
    <header className="relative sticky top-0 z-10 flex items-center justify-between border-b bg-white p-4 text-gray-500">
      <button
        onClick={onMenuClick}
        className="rounded-md p-2 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
        aria-label="Open menu"
      >
        <FiMenu size={24} />
      </button>

      <Link href="/products" legacyBehavior>
        <a className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Image src="/edesign_logo.png" alt="Edesign Logo" width={40} height={40} />
        </a>
      </Link>

      <div className="flex items-center gap-2">
        <Link href="/checkout" legacyBehavior>
          <a className="relative rounded-full p-2 hover:bg-gray-100">
            <FiShoppingCart size={24} />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {totalItems}
              </span>
            )}
          </a>
        </Link>

        {/* Conditional Profile/Login Section */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="rounded-full p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <FiUser size={24} />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="px-4 py-2 text-sm text-gray-700">
                  <p className="font-medium">Signed in as</p>
                  <p className="truncate font-semibold">{user.name}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FiLogOut className="h-4 w-4 text-gray-500" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/" legacyBehavior>
            <a className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
              Login
            </a>
          </Link>
        )}
      </div>
    </header>
  );
}