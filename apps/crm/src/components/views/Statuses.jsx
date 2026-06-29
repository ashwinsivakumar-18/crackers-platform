
import { useState } from 'react';
import { Plus, ChevronUp, ChevronDown, Trash2, X, Check } from 'lucide-react';

import { api } from '../../lib/api';
import { useAsync, Loading, ErrorState } from '../ui';

const PALETTE = ['#3b82f6', '#8b5cf6', '#06b6d4', '#E69A1F', '#E8542A', '#1E8A52', '#E5347D', '#14b8a6', '#8B8175'];

export default function Statuses() {
  const { data, loading, error, reload } = useAsync(() => api.crm.statuses(), []);
  const [editing, setEditing] = useState(null);

  const list = data?.statuses ?? [];

  const move = async (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const order = list.map((s) => s.id);
    [order[i], order[j]] = [order[j], order[i]];
    await api.crm.reorderStatuses(order);
    await reload();
  };
  const remove = async (id) => {await api.crm.deleteStatus(id);await reload();};

  return (
    <>
      <header className="top">
        <div><h1>Customer statuses</h1><p className="muted sm">Rename, recolour, reorder — the order here is shown everywhere.</p></div>
        <button className="btn btn-ink" onClick={() => setEditing('new')}><Plus size={16} /> New status</button>
      </header>

      <div className="content">
        {loading ? <Loading /> : error || !data ? <ErrorState message={error ?? 'Could not load'} onRetry={reload} /> :
        <div className="status-list">
            {list.map((s, i) =>
          <div className="status-row" key={s.id}>
                <div className="reorder">
                  <button onClick={() => move(i, -1)} disabled={i === 0}><ChevronUp size={15} /></button>
                  <button onClick={() => move(i, 1)} disabled={i === list.length - 1}><ChevronDown size={15} /></button>
                </div>
                <span className="dot" style={{ background: s.color }} />
                <div className="status-name">{s.name}</div>
                <button className="link" onClick={() => setEditing(s)}>Edit</button>
                <button className="icon-btn sm" onClick={() => remove(s.id)}><Trash2 size={14} /></button>
              </div>
          )}
          </div>
        }
      </div>

      {editing &&
      <Editor
        init={editing === 'new' ? null : editing}
        onClose={() => setEditing(null)}
        onSaved={() => {setEditing(null);reload();}} />

      }
    </>);

}

function Editor({ init, onClose, onSaved }) {
  const [name, setName] = useState(init?.name ?? '');
  const [color, setColor] = useState(init?.color ?? PALETTE[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const save = async () => {
    setBusy(true);setError(null);
    try {
      if (init) await api.crm.updateStatus(init.id, { name: name.trim(), color });else
      await api.crm.createStatus({ name: name.trim(), color });
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {setBusy(false);}
  };

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="modal sm">
        <div className="modal-head"><b>{init ? 'Edit status' : 'New status'}</b><button className="icon-btn" onClick={onClose}><X size={18} /></button></div>
        <div className="modal-body">
          <div className="field-label">Name</div>
          <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Diwali enquiry" autoFocus />
          <div className="field-label">Colour</div>
          <div className="palette">
            {PALETTE.map((c) =>
            <button key={c} className={`swatch ${c === color ? 'on' : ''}`} style={{ background: c }} onClick={() => setColor(c)}>
                {c === color && <Check size={13} />}
              </button>
            )}
          </div>
          <div className="preview-pill"><span className="status-pill" style={{ ['--c']: color }}>{name || 'Preview'}</span></div>
          {error && <p className="err-text">{error}</p>}
          <button className="btn btn-ember wide" disabled={!name.trim() || busy} onClick={save}>{busy ? 'Saving…' : init ? 'Save changes' : 'Create status'}</button>
        </div>
      </div>
    </>);

}