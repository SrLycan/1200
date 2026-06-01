'use client';

import { useParams } from 'next/navigation';
import { ArrowLeft, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLead } from '@/modules/leads/hooks/use-leads';
import { formatDate } from '@/lib/utils';

export default function LeadDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: lead, isLoading } = useLead(params.id);

  if (isLoading) return <p className="text-muted-foreground">Cargando...</p>;
  if (!lead) return <p>Lead no encontrado</p>;

  return (
    <div className="space-y-6">
      <Link href="/leads" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Volver a leads
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{lead.fullName}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Badge>{lead.status}</Badge>
            <Badge variant="secondary">{lead.source}</Badge>
            <Badge variant="outline">Score: {lead.score}</Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Información de contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {lead.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" /> {lead.phone}
              </div>
            )}
            {lead.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" /> {lead.email}
              </div>
            )}
            {lead.city && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" /> {lead.city}
              </div>
            )}
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" /> Creado: {formatDate(lead.createdAt)}
            </div>
            {lead.notes && (
              <div className="mt-4 rounded-md bg-muted p-3 text-muted-foreground">{lead.notes}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Asesor asignado</CardTitle>
          </CardHeader>
          <CardContent>
            {lead.owner ? (
              <div>
                <p className="font-medium">
                  {lead.owner.firstName} {lead.owner.lastName}
                </p>
                <p className="text-sm text-muted-foreground">{lead.owner.email}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Sin asignar</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
