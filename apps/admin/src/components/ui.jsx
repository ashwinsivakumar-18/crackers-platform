
import { useCallback, useEffect, useState } from 'react';

import { STATUS_LABEL, STATUS_TONE } from '../lib/format';

/** Tiny data-loading hook: returns { data, loading, error, reload }. */
export function useAsync(fn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fn());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {void reload();}, [reload]);
  return { data, loading, error, reload };
}

export function StatusBadge({ status }) {
  return <span className={`badge t-${STATUS_TONE[status]}`}>{STATUS_LABEL[status]}</span>;
}

export function Loading() {
  return <div className="state"><div className="spinner" /></div>;
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="state error">
      <div>{message}</div>
      {onRetry && <button className="btn" onClick={onRetry}>Retry</button>}
    </div>);

}

export function Empty({ children }) {
  return <div className="state">{children}</div>;
}

export const LivePill = () =>
<span className="live-pill"><span className="dot" /> Live</span>;