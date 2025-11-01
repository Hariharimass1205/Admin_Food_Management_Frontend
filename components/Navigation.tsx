'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/users', label: 'Users' },
  { href: '/categories', label: 'Categories' },
  { href: '/products', label: 'Products' },
  { href: '/orders', label: 'Orders' },
];

export default function Navigation() {
  const pathname = usePathname();
  const { isAuthenticated, user, logout, loading } = useAuth();
  const router = useRouter();

  if (pathname === '/login') {
    return null;
  }

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold">Food Delivery Admin</h1>
          </div>
        </div>
      </nav>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="shrink-0 flex items-center ">
              <h1 className="text-4xl font-bold">Food Delivery Admin</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === item.href
                      ? 'border-white text-white'
                      : 'border-transparent text-blue-100 hover:border-blue-300 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <span className="text-sm text-blue-100 hidden md:block">
                Welcome {user.username}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="bg-red-700 hover:bg-blue-800 text-white px-4 py-2 rounded text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      <div className="sm:hidden">
        <div className="pt-2 pb-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                pathname === item.href
                  ? 'bg-blue-700 border-white text-white'
                  : 'border-transparent text-blue-100 hover:bg-blue-700 hover:border-blue-300 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          ))}
          {user && (
            <div className="px-3 py-2 text-sm text-blue-100">
              {user.username}
            </div>
          )}
          <button
            onClick={handleLogout}
            className="block w-full text-left px-3 py-2 text-base font-medium text-blue-100 hover:bg-blue-700"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

