import { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressSpinner } from 'primereact/progressspinner';
import { PageHeader } from '@/components/common/PageHeader';
import { getStats } from '@/services/stats.service';
import type { StatsResponse } from '@/types/api.types';
import { useAppSelector } from '@/hooks/useAppSelector';
import { getErrorMessage } from '@/utils/format';

export default function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user);
  const isAdmin = user?.role === 'ADMIN';
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(isAdmin);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;

    const load = async () => {
      try {
        const data = await getStats();
        setStats(data);
      } catch (err) {
        setError(getErrorMessage(err, 'No fue posible cargar las estadísticas.'));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div>
        <PageHeader
          title={`Hola, ${user?.name ?? 'usuario'}`}
          subtitle="Bienvenido al panel de gestión de DNA Music."
        />
        <Card className="border border-dna-border bg-dna-surface">
          <p className="text-dna-muted">
            Como operador, puedes gestionar estudiantes de tu sede desde el menú lateral.
          </p>
          {user?.headquarter && (
            <p className="mt-3 text-sm text-dna-gold">
              Sede asignada: {user.headquarter.name} ({user.headquarter.city})
            </p>
          )}
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <ProgressSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Dashboard" subtitle="Resumen de estudiantes por sede y estado." />
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  const totalStudents =
    stats?.studentsPerHeadquarter.reduce((sum, item) => sum + item.count, 0) ?? 0;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Resumen visual de la operación académica."
      />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card className="border border-dna-border bg-dna-surface">
          <p className="text-xs uppercase tracking-wider text-dna-muted">Total estudiantes</p>
          <p className="mt-2 text-3xl font-bold text-dna-gold">{totalStudents}</p>
        </Card>
        <Card className="border border-dna-border bg-dna-surface">
          <p className="text-xs uppercase tracking-wider text-dna-muted">Sedes activas</p>
          <p className="mt-2 text-3xl font-bold text-white">
            {stats?.studentsPerHeadquarter.length ?? 0}
          </p>
        </Card>
        <Card className="border border-dna-border bg-dna-surface">
          <p className="text-xs uppercase tracking-wider text-dna-muted">Sede líder (activos)</p>
          <p className="mt-2 text-lg font-bold text-white">
            {stats?.topActiveHeadquarter?.headquarterName ?? '—'}
          </p>
          {stats?.topActiveHeadquarter && (
            <p className="text-sm text-dna-gold">
              {stats.topActiveHeadquarter.activeCount} estudiantes activos
            </p>
          )}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Estudiantes por sede" className="border border-dna-border bg-dna-surface">
          <DataTable
            value={stats?.studentsPerHeadquarter ?? []}
            size="small"
            stripedRows
            emptyMessage="Sin datos"
          >
            <Column field="headquarterName" header="Sede" sortable />
            <Column field="count" header="Total" sortable />
          </DataTable>
        </Card>

        <Card title="Estudiantes por estado" className="border border-dna-border bg-dna-surface">
          <DataTable
            value={stats?.studentsPerStatus ?? []}
            size="small"
            stripedRows
            emptyMessage="Sin datos"
          >
            <Column field="status" header="Estado" sortable />
            <Column field="count" header="Total" sortable />
          </DataTable>
        </Card>
      </div>
    </div>
  );
}
