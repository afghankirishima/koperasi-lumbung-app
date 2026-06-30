import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { SearchableSelect } from '../../components/SearchableSelect';
import { Save, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

export const SetoranSimpananPokok = () => {
  const { data, addTransaksiAnggota } = useContext(AppContext);
  
  const [formData, setFormData] = useState({
    anggotaId: '',
    nominal: ''
  });

  const [showSuccess, setShowSuccess] = useState(false);

  const activeAnggota = data.anggota.filter(a => a.status === 'Aktif');
  const transaksiPokok = data.transaksiAnggota.filter(t => t.jenis === 'Simpanan Pokok');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.anggotaId) return;

    addTransaksiAnggota({
      anggotaId: formData.anggotaId,
      jenis: 'Simpanan Pokok',
      nominal: formData.nominal
    });

    setShowSuccess(true);
    setFormData({ anggotaId: '', nominal: '' });
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const exportToExcel = () => {
    const exportData = transaksiPokok.map((t, index) => {
      const anggota = data.anggota.find(a => a.id === t.anggotaId);
      return {
        'No': index + 1,
        'Tanggal': new Date(t.tgl).toLocaleDateString('id-ID'),
        'Nama Anggota': anggota ? anggota.nama : 'Unknown',
        'Nominal': Number(t.nominal)
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Setoran Pokok");
    XLSX.writeFile(workbook, "Daftar_Setoran_Simpanan_Pokok.xlsx");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  return (
    <div className="page-content">
      <h2 className="page-title mb-4">Setoran Simpanan Pokok</h2>
      
      {showSuccess && (
        <div className="alert-success mb-4">
          <span>Setoran berhasil disimpan!</span>
        </div>
      )}

      <div className="card mb-4">
        <h3 className="card-title">Form Input Setoran</h3>
        <form onSubmit={handleSubmit} className="form-container">
          <div className="grid-2">
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Pilih Anggota</label>
              <SearchableSelect 
                options={activeAnggota.map(a => ({ value: a.id, label: `${a.nama} (${a.sbu})` }))}
                value={formData.anggotaId}
                onChange={(value) => setFormData({ ...formData, anggotaId: value })}
                placeholder="Cari nama anggota..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Nominal Setoran (Rp)</label>
              <input 
                type="number" 
                className="form-control" 
                value={formData.nominal}
                onChange={(e) => setFormData({ ...formData, nominal: e.target.value })}
                required 
                min="0"
              />
            </div>
          </div>
          <div className="form-actions mt-4">
            <button type="submit" className="btn btn-primary">
              <Save size={18} /> Simpan Setoran
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 className="card-title" style={{marginBottom: 0, borderBottom: 'none'}}>Daftar Setoran Simpanan Pokok</h3>
          <button className="btn btn-success" onClick={exportToExcel} disabled={transaksiPokok.length === 0}>
            <FileSpreadsheet size={18} /> Export Excel
          </button>
        </div>
        
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Nama Anggota</th>
                <th>Nominal</th>
              </tr>
            </thead>
            <tbody>
              {transaksiPokok.length > 0 ? (
                transaksiPokok.map((t) => {
                  const anggota = data.anggota.find(a => a.id === t.anggotaId);
                  return (
                    <tr key={t.id}>
                      <td>{new Date(t.tgl).toLocaleDateString('id-ID')}</td>
                      <td>{anggota ? anggota.nama : 'Unknown'}</td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(t.nominal)}</td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>Belum ada transaksi.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
