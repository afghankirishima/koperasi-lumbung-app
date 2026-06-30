import React, { useState, useContext } from 'react';
import { SearchableSelect } from '../../components/SearchableSelect';
import { AppContext } from '../../context/AppContext';
import { Save } from 'lucide-react';

const formatRibuan = (val) => {
  if (!val) return '';
  const num = val.toString().replace(/[^0-9]/g, '');
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};
const parseRibuan = (val) => {
  if (!val) return '';
  return val.toString().replace(/[^0-9]/g, '');
};


export const TransaksiTabungan = ({ jenis }) => {
  const { data, addTransaksiTabungan } = useContext(AppContext);
  const [tabunganId, setTabunganId] = useState('');
  const [jenisSimpanan, setJenisSimpanan] = useState('Simpanan Sukarela');
  const [nominal, setNominal] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const activeTabungan = data.tabungan.filter(t => t.status === 'Aktif');

  // Build searchable options
  const tabunganOptions = activeTabungan.map(t => {
    const ang = data.anggota.find(a => a.id === t.anggotaId);
    const label = jenis === 'Penarikan'
      ? `${ang?.nama || '-'} (${ang?.sbu}) — ${t.noRekening} | Saldo Sukarela: Rp ${Number(t.saldoSukarela || 0).toLocaleString('id-ID')}`
      : `${ang?.nama || '-'} (${ang?.sbu}) — ${t.noRekening}`;
    return { value: t.id, label };
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!tabunganId) return;
    
    if (jenis === 'Penarikan') {
      const tab = activeTabungan.find(t => t.id === tabunganId);
      if (tab && Number(nominal) > tab.saldoSukarela) {
        alert(`Saldo Sukarela tidak mencukupi! Saldo: Rp ${Number(tab.saldoSukarela).toLocaleString('id-ID')}`);
        return;
      }
    }

    if (Number(nominal) < 10000) {
      alert("Minimal transaksi Rp 10.000");
      return;
    }

    addTransaksiTabungan({ tabunganId, jenis, jenisSimpanan: jenis === 'Setoran' ? jenisSimpanan : 'Simpanan Sukarela', nominal: Number(nominal) });
    setShowSuccess(true);
    setTabunganId(''); setNominal('');
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <div className="page-content">
      <h2 className="page-title mb-4">Transaksi {jenis === 'Penarikan' ? 'Penarikan Tabungan Sukarela' : `Setoran Tabungan`}</h2>
      {showSuccess && <div className="alert-success mb-4"><span>Transaksi berhasil!</span></div>}
      <div className="card">
        <form onSubmit={handleSubmit} className="form-container">
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Pilih Rekening Tabungan</label>
              <SearchableSelect
                options={tabunganOptions}
                value={tabunganId}
                onChange={setTabunganId}
                placeholder="Cari nama anggota / rekening..."
              />
              {!tabunganId && <input type="text" required style={{ opacity: 0, height: 0, position: 'absolute' }} tabIndex={-1} />}
            </div>

            {jenis === 'Setoran' && (
              <div className="form-group">
                <label className="form-label">Jenis Simpanan</label>
                <select className="form-control" value={jenisSimpanan} onChange={(e) => setJenisSimpanan(e.target.value)}>
                  <option value="Simpanan Pokok">Simpanan Pokok</option>
                  <option value="Simpanan Wajib">Simpanan Wajib</option>
                  <option value="Simpanan Sukarela">Simpanan Sukarela</option>
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Nominal (Rp)</label>
              <input type="text" className="form-control" value={formatRibuan(nominal)} onChange={(e) => setNominal(parseRibuan(e.target.value))} required />
            </div>
          </div>
          <div className="form-actions mt-4"><button type="submit" className="btn btn-primary"><Save size={18} /> Simpan Transaksi</button></div>
        </form>
      </div>
    </div>
  );
};
