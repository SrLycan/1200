'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { User, Shield, Bell, Palette, ChevronRight } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth.store';
import { http } from '@/services/http';
import { cn } from '@/lib/utils';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  GERENCIA: 'Gerencia',
  SUPERVISOR: 'Supervisor',
  ASESOR: 'Asesor Comercial',
};

const SECTIONS = [
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'security', label: 'Seguridad', icon: Shield },
  { id: 'notifications', label: 'Notificaciones', icon: Bell },
  { id: 'appearance', label: 'Apariencia', icon: Palette },
];

export default function SettingsPage() {
  const { user, setSession, accessToken, refreshToken } = useAuthStore();
  const [section, setSection] = useState('profile');
  const [form, setForm] = useState({ firstName: user?.firstName ?? '', lastName: user?.lastName ?? '' });
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const setP = (k: string, v: string) => setPasswords((p) => ({ ...p, [k]: v }));

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!form.firstName.trim()) { toast.error('El nombre es obligatorio'); return; }
    setSaving(true);
    try {
      const { data } = await http.patch(`/users/${user?.id}`, form);
      if (user && accessToken && refreshToken) {
        setSession({ ...user, ...data?.data }, accessToken, refreshToken);
      }
      toast.success('Perfil actualizado');
    } catch {
      toast.error('No se pudo actualizar el perfil');
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (passwords.next !== passwords.confirm) { toast.error('Las contraseñas no coinciden'); return; }
    if (passwords.next.length < 8) { toast.error('La contraseña debe tener al menos 8 caracteres'); return; }
    setSaving(true);
    try {
      await http.patch('/auth/password', { currentPassword: passwords.current, newPassword: passwords.next });
      toast.success('Contraseña actualizada correctamente');
      setPasswords({ current: '', next: '', confirm: '' });
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message ?? 'No se pudo cambiar la contraseña');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 lg:flex-row">
      {/* Sidebar nav */}
      <div className="w-full lg:w-56 shrink-0">
        <Card>
          <CardContent className="p-2">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => setSection(s.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    section === s.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1 text-left">{s.label}</span>
                  {section === s.id && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
                </button>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-5">
        {/* Profile section */}
        {section === 'profile' && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="font-display">Tu perfil</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6 flex items-center gap-4">
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-primary text-xl font-bold text-primary-foreground uppercase">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                  <div>
                    <p className="font-display font-bold text-lg">{user?.firstName} {user?.lastName}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                    <span className="mt-1 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary border-primary/20">
                      {ROLE_LABELS[user?.role ?? ''] ?? user?.role}
                    </span>
                  </div>
                </div>
                <form onSubmit={saveProfile} className="space-y-4 max-w-md">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Nombre</label>
                      <Input value={form.firstName} onChange={(e) => set('firstName', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Apellido</label>
                      <Input value={form.lastName} onChange={(e) => set('lastName', e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Email</label>
                    <Input value={user?.email ?? ''} disabled className="opacity-60" />
                    <p className="text-xs text-muted-foreground">El email no se puede cambiar</p>
                  </div>
                  <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</Button>
                </form>
              </CardContent>
            </Card>
          </>
        )}

        {/* Security section */}
        {section === 'security' && (
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Cambiar contraseña</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={changePassword} className="space-y-4 max-w-md">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Contraseña actual</label>
                  <Input type="password" value={passwords.current} onChange={(e) => setP('current', e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Nueva contraseña</label>
                  <Input type="password" value={passwords.next} onChange={(e) => setP('next', e.target.value)} required />
                  <p className="text-xs text-muted-foreground">Mínimo 8 caracteres</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Confirmar nueva contraseña</label>
                  <Input type="password" value={passwords.confirm} onChange={(e) => setP('confirm', e.target.value)} required />
                </div>
                <Button type="submit" disabled={saving}>{saving ? 'Actualizando...' : 'Cambiar contraseña'}</Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Notifications section */}
        {section === 'notifications' && (
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Preferencias de notificaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-w-md">
                {[
                  { id: 'leads', label: 'Leads asignados', desc: 'Cuando un lead es asignado a ti' },
                  { id: 'messages', label: 'Nuevos mensajes', desc: 'Cuando recibes un mensaje' },
                  { id: 'stages', label: 'Cambios de etapa', desc: 'Cuando un lead cambia de estado' },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input type="checkbox" defaultChecked className="peer sr-only" />
                      <div className="h-5 w-9 rounded-full bg-muted peer-checked:bg-primary transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-4 after:shadow-sm" />
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Appearance section */}
        {section === 'appearance' && (
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Apariencia</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Usa el botón de luna/sol en la barra superior para cambiar entre modo claro y oscuro.</p>
              <div className="grid grid-cols-2 gap-3 max-w-sm">
                {[
                  { label: 'Modo claro', bg: 'bg-white border-2 border-primary' },
                  { label: 'Modo oscuro', bg: 'bg-gray-900 border-2 border-border' },
                ].map((t) => (
                  <div key={t.label} className={cn('rounded-lg p-4 cursor-pointer', t.bg)}>
                    <div className="space-y-1.5 mb-2">
                      <div className={cn('h-2 rounded w-full', t.label.includes('oscuro') ? 'bg-gray-700' : 'bg-gray-200')} />
                      <div className={cn('h-2 rounded w-2/3', t.label.includes('oscuro') ? 'bg-gray-700' : 'bg-gray-200')} />
                    </div>
                    <p className={cn('text-xs font-medium', t.label.includes('oscuro') ? 'text-white' : 'text-gray-900')}>{t.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}