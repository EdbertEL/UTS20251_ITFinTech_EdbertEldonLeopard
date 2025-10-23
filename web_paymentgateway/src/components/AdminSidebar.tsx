import Link from "next/link";
import { FiMenu, FiGrid, FiBarChart2, FiPackage } from "react-icons/fi";

// The props interface must be defined like this
interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// The component must accept these props
export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  return (
    <aside
      className={`fixed left-0 top-0 z-30 h-full w-64 transform bg-gray-800 p-4 text-white shadow-lg transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-xl font-bold">Admin Menu</h2>
        <button onClick={onClose} className="p-2">
          <FiMenu size={24} className="text-gray-300" />
        </button>
      </div>
      <nav>
        <ul className="space-y-4">
          <li>
            <Link href="/admin" className="flex items-center gap-3 text-lg hover:text-gray-300" onClick={onClose}>
              <FiGrid />
              Transactions
            </Link>
          </li>
          <li>
            <Link href="/admin/analytics" className="flex items-center gap-3 text-lg hover:text-gray-300" onClick={onClose}>
              <FiBarChart2 />
              Analytics
            </Link>
          </li>
          <li>
            <Link href="/admin/products" className="flex items-center gap-3 text-lg hover:text-gray-300" onClick={onClose}>
              <FiPackage />
              Products
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}