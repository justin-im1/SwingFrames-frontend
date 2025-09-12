'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Upload, Library, BarChart3, Menu, X } from 'lucide-react';
import { UserButton, useUser } from '@clerk/nextjs';
import { useAppSelector, useAppDispatch } from '../../lib/store';
import { toggleSidebar } from '../../features/ui/uiSlice';
import Button from '../ui/Button';

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Upload', href: '/upload', icon: Upload },
  { name: 'Library', href: '/library', icon: Library },
  { name: 'Compare', href: '/compare', icon: BarChart3 },
];

export default function Navbar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { sidebarOpen } = useAppSelector(state => state.ui);
  const { user, isSignedIn } = useUser();

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="p-2 rounded-lg bg-white shadow-lg border border-gray-200"
        >
          {sidebarOpen ? (
            <X className="h-6 w-6 text-gray-700" />
          ) : (
            <Menu className="h-6 w-6 text-gray-700" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ x: sidebarOpen ? 0 : '-100%' }}
        transition={{ type: 'tween', duration: 0.3 }}
        className="fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl border-r border-gray-200 lg:translate-x-0 lg:static lg:inset-0"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">GS</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                Golf Swing
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map(item => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-200">
            {isSignedIn ? (
              <div className="flex items-center space-x-3">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: 'w-8 h-8',
                    },
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.fullName || user?.firstName || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.emailAddresses[0]?.emailAddress}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Link href="/sign-in">
                  <Button variant="outline" size="sm" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm" className="w-full">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => dispatch(toggleSidebar())}
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
        />
      )}
    </>
  );
}
