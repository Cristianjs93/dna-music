import { useCallback, useEffect, useState } from 'react';
import { useToastContext } from '@/context/toast.context';
import { getErrorMessage } from '@/utils/format';

export function useResourceList<T>(
  fetcher: () => Promise<T[]>,
  loadErrorMessage: string,
) {
  const { showError } = useToastContext();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      showError(getErrorMessage(err, loadErrorMessage));
    } finally {
      setLoading(false);
    }
  }, [fetcher, loadErrorMessage, showError]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, loading, refresh, setData };
}
