
import { useState } from 'react';
import { Search } from 'lucide-react';
import { api } from '../../lib/api';
import { useAsync, Loading, ErrorState } from '../ui';

export default function Customers() {
  const [q, setQ] = useState('');
  const [statusId, setStatusId] = useState('all');

  const statuses = useAsync(() => api.crm.statuses(), []);
  const { data, loading, error, reload } = useAsync(
    () => api.crm.customers({ q: q || undefined, statusId: statusId === 'all' ? undefined : statusId }),
    [q, statusId]
  );

  return (
    <div className="stack">
      <div className="filters" style={{ display: 'flex', gap: 10 }}>
        <div className="search" style={{ flex: 1 }}>
          <Search size={15} />
          <input placeholder="Search name or mobile…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="sel">
          <select value={statusId} onChange={(e) => setStatusId(e.target.value)}>
            <option value="all">All statuses</option>
            {statuses.data?.statuses.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      {loading ? <Loading /> : error || !data ? <ErrorState message={error ?? 'No data'} onRetry={reload} /> :
      <div className="panel p0">
          <table className="tbl">
            <thead><tr><th>Customer</th><th>City</th><th>Status</th></tr></thead>
            <tbody>
              {data.items.map((c) =>
            <tr key={c.id}>
                  <td><div style={{ fontWeight: 600 }}>{c.name}</div><div className="muted mono sm">{c.mobile}</div></td>
                  <td>{c.city ?? '—'}</td>
                  <td>
                    {c.status ?
                <span className="badge" style={{ background: 'color-mix(in srgb, ' + c.status.color + ' 14%, #fff)', color: c.status.color }}>
                        {c.status.name}
                      </span> :
                '—'}
                  </td>
                </tr>
            )}
            </tbody>
          </table>
          {data.items.length === 0 && <div className="state">No customers match these filters.</div>}
        </div>
      }
    </div>);

}