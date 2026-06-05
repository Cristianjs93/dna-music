import { useCallback, useEffect, useMemo, useState } from 'react';
import { getStats } from '@/services/stats.service';
import type { StatsResponse } from '@/types/api.types';
import { getErrorMessage } from '@/utils/format';

export function useStats(enabled: boolean) {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getStats();
      setStats(data);
    } catch (err) {
      setError(getErrorMessage(err, 'No fue posible cargar las estadísticas.'));
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const totalStudents = useMemo(
    () => stats?.studentsPerHeadquarter.reduce((sum, item) => sum + item.count, 0) ?? 0,
    [stats],
  );

  return { stats, loading, error, totalStudents };
}
