import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { CheckCircle } from 'lucide-react';

const fmtIDR = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(val) || 0);
const fmtDate = (val) => val ? new Date(val).toLocaleDateString('id-ID') : '-';

export const ApprovePinjaman = () => {
  const { data, updateStatusPinjaman } = useContext(AppContext);
  const [successMsg, setSuccessMsg] = useState('');
  const [nominalDisetujuiState, setNominalDisetujuiState] = useState({});
  const [tenorDisetujuiState, setTenorDisetujuiState] = useState({});

  // Only show pengajuan that haven't been approved yet
  const pendingList = data.pinjaman.filter(p => p.status === 'Pengajuan');

  const parseRibuan = (val) => val ? val.toString().replace(/[^0-9]/g, '') : '';
  const formatRibuan = (val) => {
    if (!val) return '';
    return val.toString().replace(/[^0-9]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleAction = (pinjaman, status, msg) => {
    let extraData = {};
    if (status === 'Disetujui') {
      extraData.nominalPinjaman = nominalDisetujuiState[pinjaman.id] ? Number(parseRibuan(nominalDisetujuiState[pinjaman.id])) : pinjaman.nominalPinjaman;
      extraData.tenorBulan = tenorDisetujuiState[pinjaman.id] !== undefined ? Number(tenorDisetujuiState[pinjaman.id]) : pinjaman.tenorBulan;
    }
    updateStatusPinjaman(pinjaman.id, status, extraData);
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  return (
    <div className="page-content">
      <h2 className="page-title mb-4">Approve Pinjaman</h2>
      {successMsg && (
        <div className={`alert-${successMsg.includes('ditolak') ? 'error' : 'success'} mb-4`} style={{ background: successMsg.includes('ditolak') ? '#fee2e2' : undefined, color: successMsg.includes('ditolak') ? '#b91c1c' : undefined }}>
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <div style={{ padding: '20px 24px 12px', borderBottom: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Daftar pengajuan pinjaman yang menunggu persetujuan. Klik <strong>Approve</strong> untuk menyetujui atau <strong>Reject</strong> untuk menolak.
          </p>
        </div>
        <table className="data-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>No</th>
              <th>Tanggal Pengajuan</th>
              <th>Nama Anggota</th>
              <th>Nominal Disetujui</th>
              <th>Tenor</th>
              <th>Tujuan</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pendingList.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                Tidak ada pengajuan pinjaman yang menunggu persetujuan.
              </td></tr>
            ) : pendingList.map((p, i) => {
              const ang = data.anggota.find(a => a.id === p.anggotaId);
              return (
                <tr key={p.id}>
                  <td>{i + 1}</td>
                  <td>{fmtDate(p.tglPengajuan)}</td>
                  <td><strong>{ang?.nama || '-'}</strong> <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>({ang?.sbu})</span></td>
                  <td>
                    <input 
                      type="text" 
                      className="form-control" 
                      style={{ margin: 0, minWidth: '130px', padding: '6px 12px' }}
                      value={formatRibuan(nominalDisetujuiState[p.id] !== undefined ? nominalDisetujuiState[p.id] : p.nominalPinjaman)}
                      onChange={(e) => setNominalDisetujuiState({ ...nominalDisetujuiState, [p.id]: parseRibuan(e.target.value) })}
                    />
                  </td>
                  <td>
                    <select 
                      className="form-control" 
                      style={{ margin: 0, minWidth: '110px', padding: '6px 12px' }}
                      value={tenorDisetujuiState[p.id] !== undefined ? tenorDisetujuiState[p.id] : p.tenorBulan}
                      onChange={(e) => setTenorDisetujuiState({ ...tenorDisetujuiState, [p.id]: e.target.value })}
                    >
                      {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                        <option key={num} value={num}>{num} Bulan</option>
                      ))}
                    </select>
                  </td>
                  <td>{p.tujuan || '-'}</td>
                  <td>
                    <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, background: '#FEF3C7', color: '#92400E' }}>
                      Pending
                    </span>
                  </td>
                  <td style={{ textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button
                      className="btn btn-primary"
                      style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                      onClick={() => handleAction(p, 'Disetujui', 'Pinjaman berhasil disetujui! Status berubah menjadi Disetujui.')}
                    >
                      <CheckCircle size={14} /> Approve
                    </button>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '6px 14px', fontSize: '0.85rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px' }}
                      onClick={() => handleAction(p, 'Ditolak', 'Pinjaman telah ditolak.')}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
