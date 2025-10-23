import { useState, type ReactNode } from 'react';
import AdminHeader from '@/components/AdminHeader'; // ✅ Corrected import
import AdminSidebar from '@/components/AdminSidebar';

interface AdminLayoutProps {
  children: ReactNode;
  pageTitle: string;
}

export default function AdminLayout({ children, pageTitle }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {isSidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black opacity-50" onClick={toggleSidebar}></div>
      )}
      <AdminSidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />
      
      {/* ✅ Corrected component usage */}
      <AdminHeader onMenuClick={toggleSidebar} />

      <main className="p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{pageTitle}</h1>
        {children}
      </main>
    </div>
  );
}