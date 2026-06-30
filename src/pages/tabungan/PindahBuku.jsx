import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { SearchableSelect } from '../../components/SearchableSelect';
import { Save } from 'lucide-react';

export const PindahBuku = () => {
  const { data, updateAnggotaSbu } = useContext(AppContext);
  const [anggotaId, setAnggotaId] = useState('');
  const [sbuBaru, setSbuBaru] = useState('MAB');
  const [showSuccess, setShowSuccess] = useState(false);

  const activeAnggota = data.anggota.filter(a => a.status === 'Aktif');

  const selectedAnggota = activeAnggota.find(a => a.id === anggotaId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!anggotaId) return;
    if (selectedAnggota && selectedAnggota.sbu === sbuBaru) {
      alert('SBU tujuan sama dengan SBU saat ini!');
      return;
    }
    updateAnggotaSbu(anggotaId, sbuBaru);
    setShowSuccess(true);
    setAnggotaId(''); setSbuBaru('MAB');
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <div className="page-content">
      <h2 className="page-title mb-4">Pindah Buku (Pindah SBU)</h2>
      {showSuccess && <div className="alert-success mb-4"><span>SBU Anggota berhasil diperbarui!</span></div>}
      <div className="card">
        <form onSubmit={handleSubmit} className="form-container">
          <div className="grid-2">
            <div className="form-group" style={{ flex: 1, minWidth: '250px' }}>
              <label className="form-label">Pilih Anggota</label>
              <SearchableSelect 
                options={activeAnggota.map(a => ({ value: a.id, label: `${a.nama} (${a.sbu})` }))}
                value={anggotaId}
                onChange={setAnggotaId}
                placeholder="Cari nama anggota..."
              />
            </div>
            {selectedAnggota && (
              <div className="form-group">
                <label className="form-label">SBU Saat Ini</label>
                <input type="text" className="form-control" value={selectedAnggota.sbu} disabled />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">SBU Tujuan</label>
              <select className="form-control" value={sbuBaru} onChange={(e) => setSbuBaru(e.target.value)} required>
                <option value="MAB">MAB</option>
                <option value="HLJ">HLJ</option>
                <option value="NPA">NPA</option>
              </select>
            </div>
          </div>
          <div className="form-actions mt-4">
            <button type="submit" className="btn btn-primary">
              <Save size={18} /> Proses Pindah SBU
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
