import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiMenu, FiUser, FiLogOut } from 'react-icons/fi';

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    // Perform logout logic (e.g., clearing session/token)
    // Then redirect to the login page
    router.push('/admin/login');
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-white p-4 text-gray-500">
      {/* 1. Hamburger Menu Button (with improved styling) */}
      <button
        onClick={onMenuClick}
        className="rounded-md p-2 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
        aria-label="Open menu"
      >
        <FiMenu size={24} />
      </button>

      {/* 2. Centered Logo */}
      <Link href="/admin" legacyBehavior>
        <a className="absolute left-1/2 -translate-x-1/2">
          <Image
            src="/edesign_logo.png"
            alt="Edesign Logo"
            width={40}
            height={40}
          />
        </a>
      </Link>

      {/* 3. Profile Icon and Logout Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="rounded-full p-2 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
          aria-label="Open user menu"
        >
          <FiUser size={24} />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div
            className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            role="menu"
            aria-orientation="vertical"
          >
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              <FiLogOut className="h-4 w-4 text-gray-500" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}