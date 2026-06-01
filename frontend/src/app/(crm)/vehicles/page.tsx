'use client';

import { useQuery } from '@tanstack/react-query';
import { http } from '@/services/http';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'ARCHIVED';
  mileage?: number;
  color?: string;
}

export default function VehiclesPage() {
  const { data } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => (await http.get('/vehicles')).data.data,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Inventario de vehículos</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data?.data?.map((v: Vehicle) => (
          <Card key={v.id}>
            <CardContent className="space-y-2 p-4">
              <div className="flex items-start justify-between">
                <p className="font-semibold">
                  {v.make} {v.model}
                </p>
                <Badge variant={v.status === 'AVAILABLE' ? 'default' : 'secondary'}>{v.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {v.year} · {v.color ?? '-'} · {v.mileage?.toLocaleString() ?? 0} km
              </p>
              <p className="text-lg font-bold text-primary">{formatCurrency(v.price)}</p>
            </CardContent>
          </Card>
        ))}
        {data?.data?.length === 0 && (
          <p className="text-sm text-muted-foreground">No hay vehículos registrados</p>
        )}
      </div>
    </div>
  );
}
