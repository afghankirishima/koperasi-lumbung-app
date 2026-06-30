import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { SearchableSelect } from '../../components/SearchableSelect';
import { LogOut } from 'lucide-react';

export const AnggotaKeluar = () => {
  const { data, setAnggotaKeluar } = useContext(AppContext);
  const [anggotaId, setAnggotaId] = useState('');
  const [alasan, setAlasan] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const activeAnggota = data.anggota.filter(a => a.status === 'Aktif');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!anggotaId) return;
    setAnggotaKeluar(anggotaId, alasan);
    setShowSuccess(true);
    setAnggotaId(''); setAlasan('');
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <div className="page-content">
      <h2 className="page-title mb-4">Input Pengajuan Anggota Keluar</h2>
      {showSuccess && <div className="alert-success mb-4"><span>Pengajuan keluar berhasil disubmit. Menunggu Approve.</span></div>}
      
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Pilih Anggota</label>
              <SearchableSelect 
                options={activeAnggota.map(a => ({ value: a.id, label: `${a.nama} (${a.sbu})` }))}
                value={anggotaId}
                onChange={setAnggotaId}
                placeholder="Cari nama anggota..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Alasan Keluar</label>
              <input type="text" className="form-control" value={alasan} onChange={(e) => setAlasan(e.target.value)} required />
            </div>
          </div>
          <div className="form-actions mt-4"><button type="submit" className="btn btn-primary" style={{backgroundColor: 'var(--danger)'}}><LogOut size={18} /> Proses Keluar</button></div>
        </form>
      </div>
    </div>
  );
};
