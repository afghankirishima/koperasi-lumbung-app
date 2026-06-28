import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { Save, CheckCircle } from 'lucide-react';

const formatRibuan = (val) => {
  if (!val) return '';
  const num = val.toString().replace(/[^0-9]/g, '');
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};
const parseRibuan = (val) => {
  if (!val) return '';
  return val.toString().replace(/[^0-9]/g, '');
};

const INITIAL_FORM = {
  nama: '',
  alamat: '',
  jenisKelamin: 'L',
  tglMasuk: new Date().toISOString().split('T')[0],
  sbu: 'MAB',
  simpananPokok: 0,
  simpananWajib: 0,
  bank: 'Mandiri',
  noRekening: '13900',
  noTelepon: '', 
  noKtp: '',
  tempatLahir: '',
  tglLahir: '',
};

export const RegistrasiAnggota = () => {
  const { addAnggota, addTabungan } = useContext(AppContext);
  
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validasi noRekening tidak boleh hanya '13900'
    if (formData.noRekening === '13900' || formData.noRekening.length <= 5) {
      alert('Nomor rekening harus diisi lengkap!');
      return;
    }
    // console.log('FormData yang dikirim:', formData);
    try {
      await addAnggota(formData); // backend sekalian bikin tabungan + transaksi setoran awal
      setFormData(INITIAL_FORM);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      alert(error?.response?.data?.error || 'Gagal menyimpan data!');
    }
  };

  return (
    <div className="page-content">
      <h2 className="page-title mb-4">Registrasi Anggota Baru</h2>
      
      {showSuccess && (
        <div className="alert-success">
          <CheckCircle size={20} />
          <span>Anggota berhasil didaftarkan! Formulir telah dikosongkan, Anda bisa mendaftarkan anggota baru.</span>
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit} className="form-container">
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Nama Lengkap</label>
              <input 
                type="text" 
                name="nama"
                className="form-control" 
                value={formData.nama}
                onChange={handleChange}
                required 
                placeholder="Masukkan nama lengkap"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Tanggal Masuk</label>
              <input 
                type="date" 
                name="tglMasuk"
                className="form-control" 
                value={formData.tglMasuk}
                onChange={handleChange}
                required 
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Alamat Lengkap</label>
              <textarea 
                name="alamat"
                className="form-control" 
                value={formData.alamat}
                onChange={handleChange}
                required 
                rows="3"
                placeholder="Masukkan alamat lengkap"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tempat Lahir</label>
              <input 
                type="text" 
                name="tempatLahir" 
                className="form-control" 
                value={formData.tempatLahir} 
                onChange={handleChange} required
                placeholder="Masukkan Tempat Lahir " />
            </div>

            <div className="form-group">
              <label className="form-label">Tanggal Lahir</label>
              <input 
                type="date" 
                name="tglLahir" 
                className="form-control" 
                value={formData.tglLahir} 
                onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Jenis Kelamin</label>
              <select 
                name="jenisKelamin"
                className="form-control" 
                value={formData.jenisKelamin}
                onChange={handleChange}
              >
                <option value="L">Laki-laki (L)</option>
                <option value="P">Perempuan (P)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">SBU (Strategic Business Unit)</label>
              <select 
                name="sbu"
                className="form-control" 
                value={formData.sbu}
                onChange={handleChange}
              >
                <option value="MAB">MAB</option>
                <option value="HLJ">HLJ</option>
                <option value="NPA">NPA</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Nomor KTP</label>
              <input 
                type="text" 
                name="noKtp" 
                className="form-control"
                value={formData.noKtp} 
                onChange={(e) => {
                  const angkaSaja = e.target.value.replace(/[^0-9]/g, '');
                  setFormData({ ...formData, noKtp: angkaSaja });
                }}
                required
                placeholder="Masukkan 16 digit NIK"
                maxLength={16}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nomor Telephone</label>
              <input 
                type="text" 
                name="noTelepon" 
                className="form-control"
                value={formData.noTelepon} 
                onChange={(e) => {
                  const angkaSaja = e.target.value.replace(/[^0-9]/g, '');
                  setFormData({ ...formData, noTelepon: angkaSaja });
                }}
                required
                placeholder="Masukkan nomor Telephone"
                maxLength={16}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Simpanan Pokok Awal</label>
              <input 
                type="text" 
                name="simpananPokok"
                className="form-control" 
                value={formatRibuan(formData.simpananPokok)}
                onChange={(e) => setFormData({ ...formData, simpananPokok: parseRibuan(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Simpanan Wajib Awal</label>
              <input 
                type="text" 
                name="simpananWajib"
                className="form-control" 
                value={formatRibuan(formData.simpananWajib)}
                onChange={(e) => setFormData({ ...formData, simpananWajib: parseRibuan(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bank</label>
              <select name="bank" className="form-control" 
                value={formData.bank} onChange={handleChange} required>
                <option value="Mandiri">Mandiri</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Nomor Rekening</label>
              <input 
                type="text" 
                name="noRekening" 
                className="form-control"
                value={formData.noRekening} 
                onChange={(e) => {
                  const val = e.target.value;
                  // Jaga prefix 13900 tidak bisa dihapus
                  if (!val.startsWith('13900')) return;
                  // Hanya angka setelah prefix
                  const suffix = val.slice(5).replace(/[^0-9]/g, '');
                  setFormData({ ...formData, noRekening: '13900' + suffix });
                }}
                required
                placeholder="13900..."
              />
            </div>

          </div>

          <div className="form-actions mt-4">
            <button type="submit" className="btn btn-primary">
              <Save size={18} />
              Simpan Data Anggota
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
