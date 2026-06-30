import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../../context/AppContext';
import { SearchableSelect } from '../../components/SearchableSelect';
import { CheckCircle } from 'lucide-react';

const fmtIDR = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(val) || 0);

export const TransaksiPelunasan = () => {
  const { data, addTransaksiPinjaman } = useContext(AppContext);
  const [pinjamanId, setPinjamanId] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Hanya pinjaman yang statusnya Aktif (sudah cair)
  const targetPinjaman = data.pinjaman.filter(p => p.status === 'Aktif');

  // Cari pinjaman yang sedang dipilih
  const selectedPinjaman = targetPinjaman.find(p => p.id === pinjamanId);
  const ang = selectedPinjaman ? data.anggota.find(a => a.id === selectedPinjaman.anggotaId) : null;

  // Hitungan
  let sisaAngsuran = 0;
  let sisaBulan = 0;
  let angsuranPerBulan = 0;
  
  if (selectedPinjaman) {
    const nominal = Number(selectedPinjaman.nominalPinjaman);
    const tenor = Number(selectedPinjaman.tenorBulan);
    const bunga = nominal * 0.02; 
    angsuranPerBulan = Math.round(bunga + (nominal / tenor));

    const existingTrx = data.transaksiPinjaman.filter(t => t.pinjamanId === pinjamanId && t.jenis === 'Angsuran');
    const jumlahDibayar = existingTrx.length;
    
    sisaBulan = tenor - jumlahDibayar;
    sisaAngsuran = sisaBulan * angsuranPerBulan;
  }

  const handlePelunasan = () => {
    if (!selectedPinjaman) return;

    // Tambah transaksi Pelunasan. Backend akan otomatis update status ke 'Lunas'
    addTransaksiPinjaman({ 
      pinjamanId, 
      jenis: 'Pelunasan', 
      nominal: sisaAngsuran 
    });

    setShowSuccess(true);
    setPinjamanId('');
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <div className="page-content">
      <h2 className="page-title mb-4" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <CheckCircle size={24} color="var(--primary)" /> Pelunasan Pinjaman
      </h2>

      {showSuccess && (
        <div className="alert-success mb-4">
          <span>Pelunasan berhasil! Pinjaman anggota telah dilunasi.</span>
        </div>
      )}

      <div className="card mb-4">
        <div className="form-group mb-0">
          <label className="form-label" style={{ color: 'var(--text-muted)' }}>Pilih Pinjaman Aktif</label>
          <SearchableSelect 
            options={targetPinjaman.map(p => {
              const a = data.anggota.find(a => a.id === p.anggotaId);
              return { 
                value: p.id, 
                label: `${a?.nama || 'Unknown'} - Rp ${Number(p.nominalPinjaman).toLocaleString('id-ID')}` 
              };
            })}
            value={pinjamanId}
            onChange={setPinjamanId}
            placeholder="Pilih Pinjaman..."
          />
        </div>
      </div>

      {selectedPinjaman && (
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px' }}>Detail Pelunasan - {ang?.nama}</h3>
          
          <div className="grid-2 mb-4">
            <div className="form-control" style={{ background: 'var(--bg-secondary)', height: 'auto', padding: '16px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Plafon Pinjaman</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{fmtIDR(selectedPinjaman.nominalPinjaman)}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '12px', marginBottom: '4px' }}>Tenor</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{selectedPinjaman.tenorBulan} Bulan</div>
            </div>
            
            <div className="form-control" style={{ background: '#d1fae5', borderColor: '#a7f3d0', height: 'auto', padding: '16px' }}>
              <div style={{ color: '#065f46', fontSize: '0.9rem', marginBottom: '4px' }}>Sisa Tenor</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#065f46' }}>{sisaBulan} Bulan</div>
              <div style={{ color: '#065f46', fontSize: '0.9rem', marginTop: '12px', marginBottom: '4px' }}>Total Pelunasan</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#064e3b' }}>{fmtIDR(sisaAngsuran)}</div>
            </div>
          </div>
          
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
            Pelunasan akan melunasi semua sisa tagihan angsuran sekaligus dan mengubah status pinjaman menjadi <strong>Lunas</strong>.
          </p>

          <button 
            className="btn btn-primary" 
            onClick={handlePelunasan}
            disabled={sisaAngsuran <= 0}
          >
            Proses Pelunasan
          </button>
        </div>
      )}
    </div>
  );
};
