
import { useCallback, useEffect, useState } from 'react';

export function useAsync(fn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const reload = useCallback(async () => {
    setLoading(true);setError(null);
    try {setData(await fn());}
    catch (e) {setError(e instanceof Error ? e.message : 'Something went wrong');} finally
    {setLoading(false);}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(() => {void reload();}, [reload]);
  return { data, loading, error, reload };
}

export const Loading = () => <div className="state"><div className="spinner" /></div>;
export const ErrorState = ({ message, onRetry }) =>
<div className="state error"><div>{message}</div>{onRetry && <button className="btn" onClick={onRetry}>Retry</button>}</div>;