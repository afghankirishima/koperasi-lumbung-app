import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

export const SearchableSelect = ({ options, value, onChange, placeholder = 'Cari...' }) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(query.toLowerCase())
  );

  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div
        className="form-control"
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', userSelect: 'none' }}
        onClick={() => setOpen(o => !o)}
      >
        <span style={{ color: selected ? 'inherit' : 'var(--text-muted)' }}>
          {selected ? selected.label : placeholder}
        </span>
        <Search size={16} color="var(--text-muted)" />
      </div>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 9999,
          background: '#ffffff', border: '1.5px solid var(--primary)',
          borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          marginTop: '4px', overflow: 'hidden'
        }}>
          <div style={{ padding: '8px', borderBottom: '1px solid var(--border)' }}>
            <input
              autoFocus
              type="text"
              className="form-control"
              placeholder="Ketik nama anggota..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{ width: '100%', padding: '8px', fontSize: '0.9rem' }}
            />
          </div>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '12px', color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem' }}>
                Tidak ditemukan
              </div>
            ) : (
              filtered.map(o => (
                <div
                  key={o.value}
                  style={{
                    padding: '10px 12px', cursor: 'pointer', fontSize: '0.95rem',
                    background: o.value === value ? 'var(--bg-color)' : 'transparent',
                    borderBottom: '1px solid var(--border)'
                  }}
                  onMouseOver={e => e.target.style.background = '#f3f4f6'}
                  onMouseOut={e => e.target.style.background = o.value === value ? 'var(--bg-color)' : 'transparent'}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                    setQuery('');
                  }}
                >
                  {o.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
