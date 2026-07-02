import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, Calendar, BarChart3, BookOpen, LogOut, Menu, X } from 'lucide-react';
import { Button } from './ui/Button';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const navItems = [
    { name: 'Dashboard', path: '/', icon: BarChart3 },
    { name: 'Programs', path: '/programs', icon: Dumbbell },
    { name: 'History', path: '/history', icon: Calendar },
    { name: 'Exercises', path: '/exercises', icon: BookOpen },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass sticky top-0 z-40 border-b border-border/70 px-4 sm:px-6 lg:px-8 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center space-x-3 text-stone-900 hover:opacity-90">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 text-stone-50">
            <Dumbbell className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="display-face block text-xl font-semibold leading-none">RepRise</span>
            <span className="block text-[11px] uppercase tracking-[0.22em] text-stone-500">Workout tracker</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-1 rounded-full border border-border/80 bg-white/80 p-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive(item.path)
                    ? 'bg-stone-900 text-stone-50'
                    : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <div className="text-right">
            <span className="block text-[11px] uppercase tracking-[0.18em] text-stone-400">Signed in</span>
            <span className="text-sm font-medium text-stone-700">{user.name}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={logout} className="text-xs bg-white">
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout</span>
          </Button>
        </div>

        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-full border border-border/80 bg-white p-2 text-stone-600 hover:text-stone-900 focus:outline-none"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden mt-4 rounded-[1.4rem] border border-border/80 bg-white p-3 shadow-sm space-y-1 animate-in slide-in-from-top duration-200">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-2xl text-base font-medium transition-all ${
                  isActive(item.path)
                    ? 'bg-stone-900 text-stone-50'
                    : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
          <div className="pt-4 mt-2 border-t border-border/70 px-3 flex items-center justify-between">
            <span className="text-sm text-stone-500 font-medium">{user.name}</span>
            <Button variant="secondary" size="sm" onClick={() => { setIsOpen(false); logout(); }} className="bg-stone-100">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
