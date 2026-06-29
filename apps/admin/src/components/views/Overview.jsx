
import { TrendingUp } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { api } from '../../lib/api';
import { rupee } from '../../lib/format';
import { useAsync, Loading, ErrorState } from '../ui';

export default function Overview({ onGoVerify }) {
  const { data, loading, error, reload } = useAsync(async () => {
    const [overview, revenue] = await Promise.all([
    api.analytics.overview(),
    api.analytics.revenue(7)]
    );
    return { overview, series: revenue.series };
  }, []);

  if (loading) return <Loading />;
  if (error || !data) return <ErrorState message={error ?? 'No data'} onRetry={reload} />;

  const { overview, series } = data;
  const chartData = series.map((s) => ({
    d: new Date(s.day).toLocaleDateString('en-IN', { weekday: 'short' }),
    v: s.revenue
  }));

  return (
    <div className="stack">
      <div className="kpi-row">
        <div className="kpi">
          <div className="kpi-label">Revenue</div>
          <div className="kpi-value mono">{rupee(overview.revenue)}</div>
          <div className="kpi-sub">approved orders</div>
        </div>
        <button className="kpi kpi-accent kpi-btn" onClick={onGoVerify}>
          <div className="kpi-label">Payments to verify</div>
          <div className="kpi-value mono">{overview.pendingPayments}</div>
          <div className="kpi-sub">Tap to review the queue →</div>
        </button>
        <div className="kpi">
          <div className="kpi-label">Orders</div>
          <div className="kpi-value mono">{overview.orders}</div>
          <div className="kpi-sub">total</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Customers</div>
          <div className="kpi-value mono">{overview.customers.toLocaleString('en-IN')}</div>
          <div className="kpi-sub">+{overview.newCustomers} new</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h3>Revenue · last 7 days</h3>
          <span className="muted"><TrendingUp size={14} /> Festival season</span>
        </div>
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ left: 4, right: 4, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#DA4B1E" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#DA4B1E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="d" tickLine={false} axisLine={false} tick={{ fill: '#847A6F', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ border: '1px solid #E7DFD3', borderRadius: 12, fontSize: 13 }}
                formatter={(v) => [rupee(v), 'Revenue']} />
              
              <Area type="monotone" dataKey="v" stroke="#DA4B1E" strokeWidth={2.5} fill="url(#g)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>);

}