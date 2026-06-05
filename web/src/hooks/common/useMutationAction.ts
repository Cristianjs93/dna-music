import { useCallback, useState } from 'react';
import { useToastContext } from '@/context/toast.context';
import { getErrorMessage } from '@/utils/format';

interface MutationMessages {
  success: string;
  error: string;
  summary?: string;
}

export function useMutationAction() {
  const { showError, showSuccess } = useToastContext();
  const [saving, setSaving] = useState(false);

  const runMutation = useCallback(
    async (
      action: () => Promise<void>,
      messages: MutationMessages,
      trackSaving = true,
    ): Promise<boolean> => {
      if (trackSaving) setSaving(true);
      try {
        await action();
        showSuccess(messages.success, messages.summary);
        return true;
      } catch (err) {
        showError(getErrorMessage(err, messages.error));
        return false;
      } finally {
        if (trackSaving) setSaving(false);
      }
    },
    [showError, showSuccess],
  );

  return { saving, runMutation };
}
