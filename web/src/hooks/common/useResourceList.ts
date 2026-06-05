import { useCallback, useEffect, useRef, useState } from 'react';
import { useToastContext } from '@/context/toast.context';
import { getErrorMessage } from '@/utils/format';

export function useResourceList<T>(
  fetcher: () => Promise<T[]>,
  loadErrorMessage: string,
  enabled = true,
) {
  const { showError } = useToastContext();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(enabled);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const refresh = useCallback(async () => {
    if (!enabled) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const result = await fetcherRef.current();
      setData(result);
    } catch (err) {
      showError(getErrorMessage(err, loadErrorMessage));
    } finally {
      setLoading(false);
    }
  }, [enabled, loadErrorMessage, showError]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, loading, refresh, setData };
}
