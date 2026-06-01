'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Eye, EyeOff, LogIn } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authService } from '@/modules/auth/services/auth.service';
import { useAuthStore } from '@/store/auth.store';

export default function LoginPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [email, setEmail] = useState('admin@autosquito.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { user, accessToken, refreshToken } = await authService.login(email, password);
      setSession(user, accessToken, refreshToken);
      toast.success(`Bienvenido, ${user.firstName}`);
      router.replace('/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message ?? 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      {/* Left — branding panel */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 text-white"
        style={{
          background: 'linear-gradient(135deg, hsl(215,75%,18%) 0%, hsl(215,75%,28%) 60%, hsl(215,70%,38%) 100%)',
        }}
      >
        {/* Decorative circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-white/5" />
          <div className="absolute top-1/2 -right-24 h-64 w-64 rounded-full bg-white/5" />
          <div className="absolute -bottom-24 left-1/4 h-80 w-80 rounded-full bg-white/5" />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
            <span className="font-display text-sm font-bold">AQ</span>
          </div>
          <div>
            <p className="font-display text-lg font-bold leading-tight">Autos Quito</p>
            <p className="text-xs text-white/60 uppercase tracking-widest">CRM Profesional</p>
          </div>
        </div>

        {/* Quote */}
        <div className="relative">
          <div className="mb-6 h-1 w-12 rounded-full bg-yellow-400" />
          <p className="font-display text-3xl font-bold leading-tight mb-4">
            Gestiona tu concesionaria con precisión
          </p>
          <p className="text-white/60 text-sm leading-relaxed max-w-xs">
            Leads, pipeline, conversaciones y inventario en un solo lugar. Diseñado para el mercado ecuatoriano.
          </p>
        </div>

        {/* Features */}
        <div className="relative flex gap-6 text-xs text-white/60">
          {['Pipeline Kanban', 'WhatsApp & Instagram', 'Inventario completo'].map((f) => (
            <div key={f} className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right — login form */}
      <div className="flex items-center justify-center bg-background p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">AQ</div>
            <p className="font-display font-bold">Autos Quito CRM</p>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-2xl font-bold">Iniciar sesión</h1>
            <p className="text-sm text-muted-foreground mt-1">Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@autosquito.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Contraseña</label>
                <button type="button" className="text-xs text-primary hover:underline">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Ingresando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Ingresar
                </div>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Autos Quito · Todos los derechos reservados
          </p>
        </div>
      </div>
    </div>
  );
}