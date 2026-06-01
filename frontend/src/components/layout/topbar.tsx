'use client';

import { Bell, Search, Sun, Moon, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { http } from '@/services/http';
import { useAuthStore } from '@/store/auth.store';

export function Topbar() {
  const [dark, setDark] = useState(false);
  const user = useAuthStore((s) => s.user);

  // Unread notifications count
  const { data: notifications } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const { data } = await http.get('/notifications', { params: { pageSize: 1 } });
      return data?.data as { unreadCount?: number } | undefined;
    },
    refetchInterval: 30_000,
  });

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') {
      document.documentElement.classList.add('dark');
      setDark(true);
    }
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-card px-6">
      {/* Mobile menu trigger placeholder */}
      <button className="md:hidden rounded-md p-2 hover:bg-muted transition-colors">
        <Menu className="h-5 w-5" />
      </button>

      {/* Search */}
      <div className="relative max-w-sm flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Buscar leads, vehículos..."
          className="h-9 w-full rounded-md border bg-muted/40 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background transition-colors"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title={dark ? 'Modo claro' : 'Modo oscuro'}
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Notifications */}
        <Link
          href="/notifications"
          className="relative grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
        </Link>

        {/* User avatar */}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground uppercase cursor-default">
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
      </div>
    </header>
  );
}