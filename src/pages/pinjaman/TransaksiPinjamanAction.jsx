import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { CheckCircle, Clock } from 'lucide-react';

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

export const TransaksiPinjamanAction = ({ action }) => {
  const { data, updateStatusPinjaman, addTransaksiPinjaman } = useContext(AppContext);
  const [showSuccess, setShowSuccess] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Pencairan: Tampilkan Disetujui (Belum Cair) & Aktif (Sudah Cair)
  // Pelunasan: Tampilkan Lunas
  let tableData = [];
  if (action === 'Pencairan') {
    tableData = data.pinjaman.filter(p => p.status === 'Disetujui' || p.status === 'Aktif');
    if (filterStatus === 'Belum Cair') {
      tableData = tableData.filter(p => p.status === 'Disetujui');
    } else if (filterStatus === 'Sudah Cair') {
      tableData = tableData.filter(p => p.status === 'Aktif');
    }
  } else if (action === 'Pelunasan') {
    tableData = data.pinjaman.filter(p => p.status === 'Lunas');
  }

  if (searchQuery) {
    tableData = tableData.filter(p => {
      const ang = data.anggota.find(a => a.id === p.anggotaId);
      return ang && ang.nama.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }

  tableData.sort((a, b) => new Date(b.tglPengajuan) - new Date(a.tglPengajuan));

  const handleCairkan = (pinjamanId, nominalAsli) => {
    addTransaksiPinjaman({ 
      pinjamanId, 
      jenis: 'Pencairan', 
      nominal: Number(nominalAsli)
    });
    // Status pinjaman akan otomatis diupdate ke Aktif oleh backend saat jenis === 'Pencairan'
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <div className="page-content">
      <h2 className="page-title mb-4">
        {action === 'Pencairan' ? 'Status Pencairan Pinjaman' : 'Daftar Pinjaman Lunas'}
      </h2>
      
      {showSuccess && (
        <div className="alert-success mb-4">
          <span>Proses pencairan berhasil! Dana telah dicairkan ke anggota.</span>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <div style={{ padding: '20px 24px 12px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, flex: 1, minWidth: '250px' }}>
            {action === 'Pencairan' 
              ? 'Daftar anggota yang pengajuannya sudah disetujui. Klik "Cairkan" untuk melakukan pencairan.'
              : 'Daftar anggota yang sudah melunasi seluruh angsuran pinjaman.'}
          </p>
          {action === 'Pencairan' && (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Cari nama anggota..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '220px', margin: 0 }}
              />
              <select 
                className="form-control" 
                style={{ width: 'auto', minWidth: '180px', margin: 0 }}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="Semua">Semua Status</option>
                <option value="Belum Cair">Belum Cair</option>
                <option value="Sudah Cair">Sudah Cair</option>
              </select>
            </div>
          )}
        </div>
        <div className="table-container">
          <table className="data-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Anggota</th>
                <th>Nominal Pinjaman</th>
                <th>Tenor</th>
                <th>Status</th>
                <th>Tanggal Pengajuan</th>
                {action === 'Pencairan' && <th style={{ textAlign: 'center' }}>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {tableData.length === 0 ? (
                <tr>
                  <td colSpan={action === 'Pencairan' ? 7 : 6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    Tidak ada data pinjaman.
                  </td>
                </tr>
              ) : tableData.map((p, i) => {
                const ang = data.anggota.find(a => a.id === p.anggotaId);
                
                let displayStatus = p.status;
                let statusColor = '#065f46';
                let statusBg = '#d1fae5';
                
                if (action === 'Pencairan') {
                  if (p.status === 'Disetujui') {
                    displayStatus = 'Belum Cair';
                    statusBg = '#FEF3C7';
                    statusColor = '#92400E';
                  } else if (p.status === 'Aktif') {
                    displayStatus = 'Sudah Cair';
                  }
                }

                return (
                  <tr key={p.id}>
                    <td>{i + 1}</td>
                    <td><strong>{ang?.nama || '-'}</strong> <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>({ang?.sbu})</span></td>
                    <td style={{ fontWeight: 600 }}>{fmtIDR(p.nominalPinjaman)}</td>
                    <td>{p.tenorBulan} Bulan</td>
                    <td>
                      <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, background: statusBg, color: statusColor }}>
                        {displayStatus}
                      </span>
                    </td>
                    <td>{fmtDate(p.tglPengajuan)}</td>
                    {action === 'Pencairan' && (
                      <td style={{ textAlign: 'center' }}>
                        {p.status === 'Disetujui' ? (
                          <button 
                            className="btn btn-primary" 
                            style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                            onClick={() => handleCairkan(p.id, p.nominalPinjaman)}
                          >
                            <CheckCircle size={14} /> Cairkan
                          </button>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            <CheckCircle size={14} color="#065f46" /> Selesai
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
