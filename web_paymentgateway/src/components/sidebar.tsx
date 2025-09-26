import Link from "next/link";
import { FiMenu } from "react-icons/fi";

interface SidebarProps {
  isOpen: boolean; // Tells if the sidebar should be open
  onClose: () => void; // Function to call when sidebar needs to close
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    // Added a background overlay and z-index to appear on top
    <aside
      className={`fixed left-0 top-0 z-30 h-full w-64 transform bg-gray-800 p-4 text-white shadow-lg transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}` // If isOpen, move to 0; otherwise, move fully left
      }
    >
      <div className="mb-8 flex items-center">
        {/* Hamburger icon for closing the sidebar */}
        <button onClick={onClose} className="p-2">
          <FiMenu size={24} className="text-gray-300" />
        </button>
        <h2 className="text-xl font-bold">Menu</h2>
      </div>
      <nav>
        <ul className="space-y-4">
          <li>
            <Link href="/products" legacyBehavior>
              <a className="text-lg hover:text-gray-300" onClick={onClose}> {/* Close sidebar on navigation */}
                Products
              </a>
            </Link>
          </li>
          <li>
            <Link href="/checkout" legacyBehavior>
              <a className="text-lg hover:text-gray-300" onClick={onClose}> {/* Close sidebar on navigation */}
                Checkout
              </a>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
);
}
