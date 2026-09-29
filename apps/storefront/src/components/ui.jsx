
import { useCallback, useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import PageIntro from './PageIntro';

export function useAsync(fn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {setData(await fn());}
    catch (e) {setError(e instanceof Error ? e.message : 'Something went wrong');} finally
    {setLoading(false);}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {void reload();}, [reload]);
  return { data, loading, error, reload };
}

export const Loading = () =>
<div className="state"><div className="spinner" /></div>;


export const ErrorState = ({ message, onRetry }) =>
<div className="state error">
    <div>{message}</div>
    {onRetry && <button className="btn" onClick={onRetry}>Retry</button>}
  </div>;
export function SignInRequired({ onSignIn, what = 'this' }) {
  return (
    <div className="cust-page">
      <PageIntro icon={ShoppingBag} eyebrow="YOUR PERSONAL CORNER" title="Welcome to your celebrations.">Sign in to keep your orders, saved favourites and delivery updates together.</PageIntro>
      <div className="empty-c" style={{ textAlign: 'center' }}>
        <ShoppingBag size={36} />
        <h3>Make yourself at home.</h3>
        <p>Please sign in to see {what}.</p>
        <button className="btn btn-ember" style={{ marginTop: 12 }} onClick={onSignIn}>Sign in</button>
      </div>
    </div>
  );
}
