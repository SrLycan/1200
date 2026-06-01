'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  KanbanSquare,
  Car,
  Bell,
  Settings,
  LogOut,
  Wrench,
  ChevronRight,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'main' },
  { href: '/leads', label: 'Leads', icon: Users, group: 'main' },
  { href: '/pipeline', label: 'Pipeline', icon: KanbanSquare, group: 'main' },
  { href: '/conversations', label: 'Conversaciones', icon: MessageSquare, group: 'main', badge: 'unread' },
  { href: '/vehicles', label: 'Vehículos', icon: Car, group: 'catalog' },
  { href: '/workshop', label: 'Taller', icon: Wrench, group: 'catalog' },
  { href: '/notifications', label: 'Notificaciones', icon: Bell, group: 'system' },
  { href: '/settings', label: 'Configuración', icon: Settings, group: 'system' },
];

const GROUP_LABELS: Record<string, string> = {
  main: 'Comercial',
  catalog: 'Inventario',
  system: 'Sistema',
};

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const groups = ['main', 'catalog', 'system'];

  return (
    <aside className="hidden w-60 shrink-0 flex-col bg-sidebar md:flex" style={{ borderRight: '1px solid hsl(var(--sidebar-border))' }}>
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-5" style={{ borderBottom: '1px solid hsl(var(--sidebar-border))' }}>
        <div className="relative flex h-9 w-9 items-center justify-center rounded-lg overflow-hidden">
          <div className="absolute inset-0 gradient-bar opacity-90" />
          <span className="relative z-10 font-display text-sm font-bold text-white tracking-wider">AQ</span>
        </div>
        <div>
          <p className="font-display text-sm font-700 text-white leading-tight">Autos Quito</p>
          <p className="text-[10px] text-sidebar-muted uppercase tracking-widest">CRM Pro</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-4 px-3">
        {groups.map((group) => {
          const items = NAV.filter((n) => n.group === group);
          return (
            <div key={group} className="mb-5">
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-muted">
                {GROUP_LABELS[group]}
              </p>
              <div className="space-y-0.5">
                {items.map((item) => {
                  const Icon = item.icon;
                  const active = pathname?.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                       href={item.href as any}
                      className={cn(
                        'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150',
                        active
                          ? 'bg-sidebar-active text-white'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-white',
                      )}
                    >
                      <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-white' : 'text-sidebar-muted')} />
                      <span className="flex-1">{item.label}</span>
                      {active && <ChevronRight className="h-3 w-3 opacity-60" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 pb-4" style={{ borderTop: '1px solid hsl(var(--sidebar-border))' }}>
        <div className="mb-1 flex items-center gap-3 rounded-md px-3 pt-4 pb-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-active text-[11px] font-bold text-white uppercase">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="truncate text-[10px] text-sidebar-muted uppercase tracking-wide">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-muted transition-colors hover:bg-sidebar-accent hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}