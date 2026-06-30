import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { SearchableSelect } from '../../components/SearchableSelect';
import { Save, CheckCircle } from 'lucide-react';
import axios from 'axios';
const API_URL = 'http://localhost:5000/api';

export const RegistrasiTabungan = () => {
  const { data, addTabungan } = useContext(AppContext);
  const [anggotaId, setAnggotaId] = useState('');
  const [noRekening, setNoRekening] = useState('');
  const [bank, setBank] = useState('Mandiri');
  const [showSuccess, setShowSuccess] = useState(false);

  // Hanya anggota aktif yang BELUM memiliki rekening tabungan
  const anggotaDenganRekening = new Set(data.tabungan.map(t => t.anggotaId));
  const activeAnggota = data.anggota.filter(a => a.status === 'Aktif' && !anggotaDenganRekening.has(a.id));
  const selectedAnggota = data.anggota.find(a => a.id === anggotaId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!anggotaId || !noRekening) return;
    try {
      await addTabungan({ anggotaId, noRekening, bank });
      setShowSuccess(true);
      setAnggotaId('');
      setNoRekening('');
      setBank('Mandiri');
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      alert(error.response?.data?.error || "Gagal membuat rekening. Pastikan nomor rekening belum digunakan.");
    }
  };

  return (
    <div className="page-content">
      <h2 className="page-title mb-4">Registrasi Rekening</h2>
      {showSuccess && <div className="alert-success mb-4"><span>Rekening Tabungan berhasil dibuat!</span></div>}
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

            <div className="form-group">
              <label className="form-label">Bank</label>
              <select className="form-control" value={bank} onChange={(e) => setBank(e.target.value)} required>
                <option value="Mandiri">Mandiri</option>
              </select>
            </div>

            {selectedAnggota && (
              <div className="form-group">
                <label className="form-label">Info Simpanan Anggota</label>
                <div className="form-control" style={{background: 'var(--bg-secondary)', height: 'auto', paddingTop: '8px', paddingBottom: '8px'}}>
                  <div>Simpanan Pokok: <strong>Rp {(selectedAnggota.simpananPokok || 0).toLocaleString('id-ID')}</strong></div>
                  <div>Simpanan Wajib: <strong>Rp {(selectedAnggota.simpananWajib || 0).toLocaleString('id-ID')}</strong></div>
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Nomor Rekening</label>
              <input 
                type="text" 
                className="form-control" 
                value={noRekening} 
                onChange={(e) => setNoRekening(e.target.value)} 
                required 
                placeholder="Masukkan nomor rekening..."
              />
            </div>
          </div>
          <p style={{color: 'var(--text-secondary)', fontSize: '13px', marginTop: '12px'}}>
            ℹ️ Saldo Simpanan Pokok dan Wajib akan otomatis masuk ke rekening ini setelah Anda klik <strong>Buat Rekening</strong>.
          </p>
          <div className="form-actions mt-4"><button type="submit" className="btn btn-primary"><Save size={18} /> Buat Rekening</button></div>
        </form>
      </div>
    </div>
  );
};
