import Image from 'next/image'; 
import Link from 'next/link';
import { FiMenu, FiShoppingCart } from 'react-icons/fi';

interface HeaderProps {
  onMenuClick: () => void; // It's a function that takes no arguments and returns nothing
}

export default function Header({ onMenuClick }: HeaderProps) {
    return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-4 text-gray-500">
      <button onClick={onMenuClick} className="p-2">
        <FiMenu size={24} className="text-gray-500" />
      </button>
      <Link href="" legacyBehavior>
        <a className="text-xl font-bold">
            <Image
                src="/edesign_logo.png"
                alt="Edesign Logo"
                width={40}
                height={40}
            />
          </a>
        </Link>
        <Link href="/checkout" legacyBehavior>
          <a className="relative">
            <FiShoppingCart size={24} />
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                2
            </span>
          </a>
        </Link>
    </header>
    );
}