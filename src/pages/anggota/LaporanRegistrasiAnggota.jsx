import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { Pencil, Trash2, FileSpreadsheet, X, Save, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

const SBU_LIST = ['MAB', 'HLJ', 'NPA'];

const formatRibuan = (val) => {
  if (!val) return '';
  const num = val.toString().replace(/[^0-9]/g, '');
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};
const parseRibuan = (val) => {
  if (!val) return '';
  return val.toString().replace(/[^0-9]/g, '');
};

const fmtDate = (val) => val ? new Date(val).toLocaleDateString('id-ID') : '-';

export const LaporanRegistrasiAnggota = () => {
  const { data, addAnggota, updateAnggota, deleteAnggota } = useContext(AppContext);

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ nama: '', alamat: '', jenisKelamin: 'L', tglMasuk: new Date().toISOString().split('T')[0], sbu: 'MAB', simpananPokok: 0, simpananWajib: 0 });

  const activeAnggota = data.anggota
    .filter(a => a.status !== 'Keluar')
    .filter(a =>
      a.nama.toLowerCase().includes(search.toLowerCase()) ||
      a.sbu.toLowerCase().includes(search.toLowerCase())
    );

  const openEdit = (a) => {
    setEditingId(a.id);
    setForm({ 
      nama: a.nama, 
      alamat: a.alamat, 
      jenisKelamin: a.jenisKelamin, 
      tglMasuk: a.tglMasuk ? a.tglMasuk.split('T')[0] : '',
      sbu: a.sbu, 
      simpananPokok: a.simpananPokok || 0, 
      simpananWajib: a.simpananWajib || 0,
      noKtp: a.noKtp || '',          // ← tambah
      noTelepon: a.noTelepon || '',  // ← tambah
      tempatLahir: a.tempatLahir || '', // ← tambah
      tglLahir: a.tglLahir ? new Date(a.tglLahir).toISOString().split('T')[0] : '', });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await updateAnggota(editingId, form);
      setSuccessMsg('Data anggota berhasil diperbarui!');
    } else {
      await addAnggota(form);
      setSuccessMsg('Anggota berhasil ditambahkan!');
    }
    setShowModal(false);
    setEditingId(null);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };


  const handleDelete = (id) => {
    deleteAnggota(id);
    setConfirmDeleteId(null);
    setSuccessMsg('Data anggota berhasil dihapus!');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(activeAnggota.map((a, i) => ({
      No: i + 1,
      'ID Anggota': a.id,
      'Nama Anggota': a.nama,
      'Jenis Kelamin': a.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan',
      'SBU': a.sbu,
      'Tgl Masuk': fmtDate(a.tglMasuk),
      'Status': a.status,
      'Tempat Lahir' : a.tempatLahir,
      'Taggal Lahir' : a.tglLahir,
      'Nomor KTP' : a.noKtp,
      'Nomor Telephone' : a.noTelepon
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Registrasi Anggota');
    XLSX.writeFile(wb, 'laporan_registrasi_anggota.xlsx');
  };

  return (
    <div className="page-content">
      <h2 className="page-title mb-4">Laporan Registrasi Anggota</h2>
      {showSuccess && (
        <div className="alert-success">
          <CheckCircle size={20} />
          <span>{successMsg}</span>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '12px', flexWrap: 'wrap' }}>
        <input type="text" className="form-control" placeholder="🔍 Cari nama atau SBU..."
          value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: '320px' }} />
        <button className="btn btn-secondary" onClick={exportToExcel}>
          <FileSpreadsheet size={16} /> Export Excel
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table className="data-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Anggota</th>
              <th>Jenis Kelamin</th>
              <th>SBU</th>
              <th>Tgl Masuk</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {activeAnggota.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>Belum ada data anggota.</td></tr>
            ) : activeAnggota.map((a, i) => (
              <tr key={a.id}>
                <td>{i + 1}</td>
                <td><strong>{a.nama}</strong></td>
                <td>{a.jenisKelamin === 'L' ? 'Laki-Laki' : 'Perempuan'}</td>
                <td><span style={{ background: 'var(--accent-light)', color: 'var(--primary-dark)', padding: '2px 10px', borderRadius: '999px', fontWeight: 700, fontSize: '0.8rem' }}>{a.sbu}</span></td>
                <td>{fmtDate(a.tglMasuk)}</td>
                <td><span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, background: '#d1fae5', color: '#065f46' }}>{a.status}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button className="btn-icon btn-edit" onClick={() => openEdit(a)} title="Edit"><Pencil size={15} /></button>
                    <button className="btn-icon btn-delete" onClick={() => setConfirmDeleteId(a.id)} title="Hapus"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Edit */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Data Anggota</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="form-container">
              <div className="grid-2">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Nama Lengkap</label>
                  <input type="text" className="form-control" value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Jenis Kelamin</label>
                  <select className="form-control" value={form.jenisKelamin} onChange={e => setForm({ ...form, jenisKelamin: e.target.value })}>
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">SBU</label>
                  <select className="form-control" value={form.sbu} onChange={e => setForm({ ...form, sbu: e.target.value })}>
                    {SBU_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Tanggal Masuk</label>
                  <input type="date" className="form-control" value={form.tglMasuk} onChange={e => setForm({ ...form, tglMasuk: e.target.value })} required disabled
                    style={{ 
                      backgroundColor: '#f3f4f6', 
                      color: '#9ca3af',
                      cursor: 'not-allowed'
                    }}
                  />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Alamat</label>
                  <textarea className="form-control" rows={3} value={form.alamat} onChange={e => setForm({ ...form, alamat: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Simpanan Pokok Awal</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formatRibuan(form.simpananPokok)} 
                    onChange={e => setForm({ ...form, simpananPokok: parseRibuan(e.target.value) })}
                    disabled
                    style={{ 
                      backgroundColor: '#f3f4f6', 
                      color: '#9ca3af',
                      cursor: 'not-allowed'
                    }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Simpanan Wajib Awal</label>
                   <input type="number" className="form-control"
                   value={formatRibuan(form.simpananWajib)}
                   onChange={e => setForm({ ...form, simpananWajib: parseRibuan(e.target.value) })} 
                   disabled
                    style={{ 
                      backgroundColor: '#f3f4f6', 
                      color: '#9ca3af',
                      cursor: 'not-allowed'
                    }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tempat Lahir</label>
                  <input type="text" className="form-control" 
                    value={form.tempatLahir} 
                    onChange={e => setForm({ ...form, tempatLahir: e.target.value })} />
                </div>

                <div className="form-group">
                  <label className="form-label">Tanggal Lahir</label>
                  <input type="date" className="form-control" 
                    value={form.tglLahir} 
                    onChange={e => setForm({ ...form, tglLahir: e.target.value })} />
                </div>

                <div className="form-group">
                  <label className="form-label">Nomor KTP</label>
                  <input type="text" className="form-control" 
                    value={form.noKtp}
                    onChange={e => setForm({ ...form, noKtp: e.target.value.replace(/[^0-9]/g, '') })}
                    maxLength={16}
                    placeholder="16 digit NIK" />
                </div>

                <div className="form-group">
                  <label className="form-label">Nomor Telepon</label>
                  <input type="text" className="form-control" 
                    value={form.noTelepon}
                    onChange={e => setForm({ ...form, noTelepon: e.target.value.replace(/[^0-9]/g, '') })}
                    placeholder="08123456789" />
                </div>
              </div>
              <div className="form-actions mt-4">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary"><Save size={16} /> Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Konfirmasi Hapus */}
      {confirmDeleteId && (
        <div className="modal-overlay" onClick={() => setConfirmDeleteId(null)}>
          <div className="modal-box" style={{ maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ color: '#dc2626' }}>⚠️ Konfirmasi Hapus Anggota</h3>
              <button className="btn-icon" onClick={() => setConfirmDeleteId(null)}><X size={18} /></button>
            </div>
            <p style={{ margin: '16px 0', color: 'var(--text-main)' }}>
              Apakah Anda yakin ingin <strong>menghapus permanen</strong> anggota ini?<br />
              Seluruh data tabungan, pinjaman, dan transaksi terkait juga akan ikut terhapus!
            </p>
            <div className="form-actions">
              <button className="btn btn-secondary" onClick={() => setConfirmDeleteId(null)}>Batal</button>
              <button className="btn" style={{ background: '#dc2626', color: 'white' }} onClick={() => handleDelete(confirmDeleteId)}>
                <Trash2 size={16} /> Ya, Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
