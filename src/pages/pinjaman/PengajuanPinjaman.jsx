import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { SearchableSelect } from '../../components/SearchableSelect';
import { Save, CheckCircle, Clock, XCircle, Calculator } from 'lucide-react';

const fmtIDR = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(val) || 0);
const fmtDate = (val) => val ? new Date(val).toLocaleDateString('id-ID') : '-';

const formatRibuan = (val) => {
  if (!val) return '';
  const num = val.toString().replace(/[^0-9]/g, '');
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};
const parseRibuan = (val) => {
  if (!val) return '';
  return val.toString().replace(/[^0-9]/g, '');
};

// Pembulatan ke kelipatan 1000 terdekat (≤499 → 000, ≥500 → 1000)
const roundCalc = (val) => Math.round(val / 1000) * 1000;

const INITIAL_FORM = { anggotaId: '', nominalPinjaman: '', tenorBulan: '12', tujuan: '' };

export const PengajuanPinjaman = () => {
  const { data, addPengajuanPinjaman } = useContext(AppContext);
  
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [showSuccess, setShowSuccess] = useState(false);
  const [simulation, setSimulation] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Anggota aktif yang TIDAK memiliki pinjaman berjalan AND SUDAH memiliki rekening tabungan
  const pinjamanAktifIds = new Set(
    data.pinjaman
      .filter(p => p.status === 'Pengajuan' || p.status === 'Disetujui' || p.status === 'Aktif')
      .map(p => p.anggotaId)
  );
  const anggotaDenganRekening = new Set(data.tabungan.map(t => t.anggotaId));
  const eligibleAnggota = data.anggota.filter(a => 
    a.status === 'Aktif' && 
    !pinjamanAktifIds.has(a.id) && 
    anggotaDenganRekening.has(a.id)
  );

  const handleCalculate = () => {
    const nominal = Number(formData.nominalPinjaman);
    const tenor = Number(formData.tenorBulan);
    if (!nominal || !tenor) return;
    const angsuran = roundCalc(nominal / tenor);
    const bunga = roundCalc(nominal * 0.015);
    const swp = roundCalc(nominal * 0.005);
    setSimulation({ angsuran, bunga, swp, total: angsuran + bunga + swp });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.anggotaId) return;
    if (Number(formData.nominalPinjaman) < 900000) {
      alert("Minimal nominal pengajuan pinjaman adalah Rp 900.000");
      return;
    }
    
    addPengajuanPinjaman(formData);
    setFormData(INITIAL_FORM);
    setSimulation(null);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const getStatusBadge = (status) => {
    const map = {
      'Pengajuan': { bg: '#FEF3C7', color: '#92400E', icon: <Clock size={12} />, label: 'Menunggu' },
      'Disetujui': { bg: '#d1fae5', color: '#065f46', icon: <CheckCircle size={12} />, label: 'Disetujui' },
      'Ditolak':   { bg: '#fee2e2', color: '#b91c1c', icon: <XCircle size={12} />, label: 'Ditolak' },
      'Aktif':     { bg: '#dbeafe', color: '#1e40af', icon: <CheckCircle size={12} />, label: 'Aktif' },
      'Lunas':     { bg: '#d1fae5', color: '#065f46', icon: <CheckCircle size={12} />, label: 'Lunas' },
    };
    const s = map[status] || { bg: '#f3f4f6', color: '#374151', icon: null, label: status };
    return (
      <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, background: s.bg, color: s.color, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        {s.icon} {s.label}
      </span>
    );
  };

  return (
    <div className="page-content">
      <h2 className="page-title mb-4">Pengajuan Pinjaman</h2>
      
      {showSuccess && (
        <div className="alert-success mb-4">
          <CheckCircle size={18} />
          <span>Pengajuan pinjaman berhasil disimpan! Formulir telah dikosongkan.</span>
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit} className="form-container">
          <div className="grid-2">
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Pilih Anggota</label>
              <SearchableSelect 
                options={eligibleAnggota.map(a => ({ value: a.id, label: `${a.nama} (${a.sbu})` }))}
                value={formData.anggotaId}
                onChange={(val) => setFormData({ ...formData, anggotaId: val })}
                placeholder="Cari nama anggota..."
              />
              {eligibleAnggota.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '6px' }}>
                  Tidak ada anggota yang memenuhi syarat (harus sudah memiliki rekening tabungan & tidak ada pinjaman aktif).
                </p>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Nominal Pengajuan (Rp)</label>
              <input 
                type="text" 
                className="form-control" 
                value={formatRibuan(formData.nominalPinjaman)}
                onChange={(e) => { setFormData({ ...formData, nominalPinjaman: parseRibuan(e.target.value) }); setSimulation(null); }}
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tenor (Bulan)</label>
              <select 
                className="form-control" 
                value={formData.tenorBulan}
                onChange={(e) => { setFormData({ ...formData, tenorBulan: e.target.value }); setSimulation(null); }}
              >
                <option value="3">3 Bulan</option>
                <option value="4">4 Bulan</option>
                <option value="5">5 Bulan</option>
                <option value="6">6 Bulan</option>
                <option value="7">7 Bulan</option>
                <option value="8">8 Bulan</option>
                <option value="9">9 Bulan</option>
                <option value="10">10 Bulan</option>
                <option value="11">11 Bulan</option>
                <option value="12">12 Bulan</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Tujuan Pinjaman</label>
              <input 
                type="text" 
                className="form-control" 
                value={formData.tujuan}
                onChange={(e) => setFormData({ ...formData, tujuan: e.target.value })}
                required 
              />
            </div>
          </div>

          {/* Tombol Calculate */}
          <div style={{ marginTop: '12px', marginBottom: simulation ? '0' : '8px' }}>
            <button
              type="button"
              className="btn"
              onClick={handleCalculate}
              disabled={!formData.nominalPinjaman || !formData.tenorBulan}
              style={{ background: 'var(--bg-secondary)', color: 'var(--text)', border: '1.5px solid var(--border)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Calculator size={16} /> Hitung Simulasi
            </button>
          </div>

          {/* Hasil Simulasi */}
          {simulation && (
            <div style={{ margin: '16px 0', padding: '16px', background: '#EFF6FF', borderRadius: '10px', border: '1px solid #BFDBFE' }}>
              <div style={{ fontWeight: 700, color: '#1e40af', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calculator size={16} /> Simulasi Pinjaman
              </div>
              <div className="grid-2" style={{ gap: '10px' }}>
                {[
                  { label: 'Angsuran (pokok/bln)', value: simulation.angsuran },
                  { label: 'Bunga (1,5%)', value: simulation.bunga },
                  { label: 'SWP (0,5%)', value: simulation.swp },
                  { label: 'Total per Bulan', value: simulation.total, highlight: true },
                ].map(item => (
                  <div key={item.label} style={{ padding: '10px 14px', background: item.highlight ? '#1e40af' : 'white', borderRadius: '8px', border: '1px solid #BFDBFE' }}>
                    <div style={{ fontSize: '0.8rem', color: item.highlight ? '#bfdbfe' : '#6b7280', marginBottom: '2px' }}>{item.label}</div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: item.highlight ? 'white' : '#1e40af' }}>{fmtIDR(item.value)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="form-actions mt-4">
            <button type="submit" className="btn btn-primary">
              <Save size={18} /> Ajukan Pinjaman
            </button>
          </div>
        </form>
      </div>

      {/* Tabel Daftar Pengajuan */}
      <div className="card mt-4" style={{ padding: 0, overflowX: 'auto' }}>
        <div style={{ padding: '20px 24px 12px', borderBottom: '1px solid var(--border)' }}>
          <h3 className="card-title" style={{ marginBottom: 0, borderBottom: 'none' }}>Daftar Pengajuan Pinjaman</h3>
        </div>
        <div className="table-container">
          <table className="data-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Anggota</th>
                <th>Nominal</th>
                <th>Tenor</th>
                <th>Tujuan</th>
                <th>Status</th>
                <th>Tanggal Pengajuan</th>
              </tr>
            </thead>
            <tbody>
              {data.pinjaman.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>Belum ada data pengajuan pinjaman.</td></tr>
              ) : (() => {
                const sortedPinjaman = [...data.pinjaman].sort((a, b) => new Date(b.tglPengajuan) - new Date(a.tglPengajuan));
                const totalPages = Math.ceil(sortedPinjaman.length / itemsPerPage);
                const startIdx = (currentPage - 1) * itemsPerPage;
                const pageData = sortedPinjaman.slice(startIdx, startIdx + itemsPerPage);
                return pageData.map((p, i) => {
                  const ang = data.anggota.find(a => a.id === p.anggotaId);
                  return (
                    <tr key={p.id}>
                      <td>{startIdx + i + 1}</td>
                      <td><strong>{ang?.nama || '-'}</strong> <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>({ang?.sbu})</span></td>
                      <td style={{ fontWeight: 600 }}>{fmtIDR(p.nominalPinjaman)}</td>
                      <td>{p.tenorBulan} Bln</td>
                      <td>{p.tujuan || '-'}</td>
                      <td>{getStatusBadge(p.status)}</td>
                      <td>{fmtDate(p.tglPengajuan)}</td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {data.pinjaman.length > itemsPerPage && (() => {
          const totalPages = Math.ceil(data.pinjaman.length / itemsPerPage);
          return (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Menampilkan {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, data.pinjaman.length)} dari {data.pinjaman.length} data
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  className="btn"
                  style={{ padding: '6px 12px', fontSize: '0.85rem', background: 'var(--bg-secondary)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '6px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className="btn"
                    style={{ padding: '6px 12px', fontSize: '0.85rem', background: page === currentPage ? 'var(--primary)' : 'var(--bg-secondary)', color: page === currentPage ? 'white' : 'var(--text)', border: '1px solid var(--border)', borderRadius: '6px', fontWeight: page === currentPage ? 700 : 400 }}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
                <button
                  className="btn"
                  style={{ padding: '6px 12px', fontSize: '0.85rem', background: 'var(--bg-secondary)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '6px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next →
                </button>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
