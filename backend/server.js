const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const path = require('path'); 

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// --- ANGGOTA ---
app.get('/api/anggota', async (req, res) => {
  const anggota = await prisma.anggota.findMany();
  res.json(anggota);
});

async function generateAnggotaId() {
  const semua = await prisma.anggota.findMany({
    select: { id: true },
  });

  const existingIds = new Set(semua.map(a => a.id));

  let id;
  do {
    // Random 6 digit: 100000 - 999999
    const random = Math.floor(Math.random() * 900000) + 100000;
    id = String(random);
  } while (existingIds.has(id)); // ulangi kalau ID sudah ada

  return id;
}

// app.post('/api/anggota', async (req, res) => {
//   const { nama, alamat, jenisKelamin, sbu, tglMasuk, simpananPokok, simpananWajib } = req.body;
//   const id = await generateAnggotaId(); 
//   const anggota = await prisma.anggota.create({
//     data: { 
//       id, nama, alamat, jenisKelamin, sbu, 
//       tglMasuk: new Date(tglMasuk),
//       simpananPokok: Number(simpananPokok) || 0,
//       simpananWajib: Number(simpananWajib) || 0,
//       sbu, 
//     }
//   });
//   res.json(anggota);
// });

app.post('/api/anggota', async (req, res) => {
  // console.log('req.body:', req.body);
  const { 
    nama, alamat, jenisKelamin, sbu, tglMasuk, 
    simpananPokok, simpananWajib,
    bank, noRekening,noTelepon,noKtp,tempatLahir,tglLahir
  } = req.body;

  if (!noRekening || !noRekening.trim()) {
    return res.status(400).json({ error: 'Nomor rekening wajib diisi.' });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const id = await generateAnggotaId();
      const sp = Number(simpananPokok) || 0;
      const sw = Number(simpananWajib) || 0;

      // Insert ke tabel Anggota
      const anggota = await tx.anggota.create({
        data: {
          id,
          nama,
          alamat,
          jenisKelamin,
          sbu,
          tglMasuk: new Date(tglMasuk),
          simpananPokok: sp,
          simpananWajib: sw,
          noTelepon,
          noKtp,
          tempatLahir,
          tglLahir: tglLahir ? new Date(tglLahir) : null,
        }
      });

      // Insert ke tabel Tabungan — saldoPokok & saldoWajib dari simpananPokok & simpananWajib
      const tabungan = await tx.tabungan.create({
        data: {
          anggotaId: anggota.id,  // pakai id anggota yang baru dibuat (bukan UUID)
          noRekening: noRekening.trim(),
          bank: bank || 'Mandiri',
          saldoPokok: sp,         // dari simpananPokok
          saldoWajib: sw,         // dari simpananWajib
          saldoSukarela: 0,
          status: 'Aktif'
        }
      });

      // Insert transaksi setoran awal simpanan pokok
      if (sp > 0) {
        await tx.transaksiTabungan.create({
          data: {
            tabunganId: tabungan.id,
            jenis: 'Setoran',
            jenisSimpanan: 'Simpanan Pokok',
            nominal: sp,
            keterangan: 'Setoran Awal (Registrasi)'
          }
        });
      }

      // Insert transaksi setoran awal simpanan wajib
      if (sw > 0) {
        await tx.transaksiTabungan.create({
          data: {
            tabunganId: tabungan.id,
            jenis: 'Setoran',
            jenisSimpanan: 'Simpanan Wajib',
            nominal: sw,
            keterangan: 'Setoran Awal (Registrasi)'
          }
        });
      }

      return { anggota, tabungan }; // ← return keduanya
    });

    res.json(result); // ← { anggota, tabungan }
  } catch (e) {
    console.error('POST /api/anggota error:', e.message);
    if (e.message.includes('Unique constraint')) {
      return res.status(400).json({ error: 'Nomor rekening sudah digunakan.' });
    }
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/anggota/:id', async (req, res) => {
  const { id } = req.params;
  const { nama, alamat, jenisKelamin, sbu, tglMasuk, simpananPokok, simpananWajib,noKtp, noTelepon, tempatLahir, tglLahir } = req.body;
  const anggota = await prisma.anggota.update({
    where: { id },
    data: { 
      nama,
      alamat, 
      jenisKelamin, 
      sbu, 
      tglMasuk: new Date(tglMasuk),
      simpananPokok: Number(simpananPokok) || 0,
      simpananWajib: Number(simpananWajib) || 0,
      noKtp: noKtp || null,           
      noTelepon: noTelepon || null,   
      tempatLahir: tempatLahir || null,
      tglLahir: tglLahir ? new Date(tglLahir) : null,
    }
  });
  res.json(anggota);
});

app.put('/api/anggota/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, alasan, tglKeluar } = req.body;
  const updateData = { status };
  
  if (alasan) updateData.alasanKeluar = alasan;
  if (tglKeluar) updateData.tglKeluar = new Date(tglKeluar);
  // Also if setting 'Keluar' and no tglKeluar provided, default to now
  if (status === 'Keluar' && !updateData.tglKeluar) {
    updateData.tglKeluar = new Date();
  }

  const anggota = await prisma.anggota.update({
    where: { id },
    data: updateData
  });
  res.json(anggota);
});

app.put('/api/anggota/:id/sbu', async (req, res) => {
  const { id } = req.params;
  const { sbu } = req.body;
  const anggota = await prisma.anggota.update({
    where: { id },
    data: { sbu }
  });
  res.json(anggota);
});

app.delete('/api/anggota/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.anggota.delete({ where: { id } });
  res.json({ success: true });
});

// --- TABUNGAN ---
app.get('/api/tabungan', async (req, res) => {
  const tabungan = await prisma.tabungan.findMany();
  res.json(tabungan);
});

app.post('/api/tabungan', async (req, res) => {
  try {
    const { anggotaId, noRekening, bank } = req.body;
    
    const result = await prisma.$transaction(async (tx) => {
      const ang = await tx.anggota.findUnique({ where: { id: anggotaId } });
      if (!ang) throw new Error('Anggota tidak ditemukan');
      
      const sp = parseFloat(ang.simpananPokok) || 0;
      const sw = parseFloat(ang.simpananWajib) || 0;
      
      const tabungan = await tx.tabungan.create({
        data: { anggotaId, noRekening: noRekening.trim(), bank: bank || 'Mandiri', saldoPokok: sp, saldoWajib: sw, saldoSukarela: 0, status: 'Aktif' }
      });
      
      if (sp > 0) {
        await tx.transaksiTabungan.create({
           data: { tabunganId: tabungan.id, jenis: 'Setoran', jenisSimpanan: 'Simpanan Pokok', nominal: sp, keterangan: 'Setoran Awal (Registrasi)' }
        });
      }
      if (sw > 0) {
        await tx.transaksiTabungan.create({
           data: { tabunganId: tabungan.id, jenis: 'Setoran', jenisSimpanan: 'Simpanan Wajib', nominal: sw, keterangan: 'Setoran Awal (Registrasi)' }
        });
      }
      
      return tabungan;
    });
    res.json(result);
  } catch (e) {
    console.error('POST /api/tabungan error:', e.message);
    if (e.message.includes('Unique constraint')) {
      res.status(400).json({ error: 'Nomor rekening sudah digunakan. Gunakan nomor rekening yang lain.' });
    } else {
      res.status(500).json({ error: e.message });
    }
  }
});


app.put('/api/tabungan/:id', async (req, res) => {
  const { id } = req.params;
  const { noRekening } = req.body;
  const tabungan = await prisma.tabungan.update({
    where: { id },
    data: { noRekening }
  });
  res.json(tabungan);
});

app.delete('/api/tabungan/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.tabungan.delete({ where: { id } });
  res.json({ success: true });
});

app.get('/api/transaksi-tabungan', async (req, res) => {
  const trx = await prisma.transaksiTabungan.findMany();
  res.json(trx);
});

app.post('/api/transaksi-tabungan', async (req, res) => {
  const { tabunganId, jenis, jenisSimpanan, nominal, keterangan } = req.body;
  
  const result = await prisma.$transaction(async (tx) => {
    const tabungan = await tx.tabungan.findUnique({ where: { id: tabunganId } });
    
    let sp = tabungan.saldoPokok;
    let sw = tabungan.saldoWajib;
    let ss = tabungan.saldoSukarela;
    
    if (jenis === 'Setoran' || jenis === 'Pindah Buku Masuk') {
       if (jenisSimpanan === 'Simpanan Pokok') sp += nominal;
       else if (jenisSimpanan === 'Simpanan Wajib') sw += nominal;
       else ss += nominal;
    } else if (jenis === 'Penarikan' || jenis === 'Pindah Buku Keluar') {
       // Penarikan murni dari saldo sukarela
       ss -= nominal;
    }

    await tx.tabungan.update({
      where: { id: tabunganId },
      data: { saldoPokok: sp, saldoWajib: sw, saldoSukarela: ss }
    });

    const finalJenisSimpanan = jenisSimpanan || 'Simpanan Sukarela';

    const trx = await tx.transaksiTabungan.create({
      data: { tabunganId, jenis, jenisSimpanan: finalJenisSimpanan, nominal, keterangan }
    });
    
    return { trx, newSaldo: { saldoPokok: sp, saldoWajib: sw, saldoSukarela: ss } };
  });

  res.json(result);
});

// --- TRANSAKSI ANGGOTA (Legacy/Tidak lagi dipakai tapi endpoint dipertahankan agar UI tidak error jika dipanggil) ---
app.get('/api/transaksi-anggota', async (req, res) => {
  const trx = await prisma.transaksiAnggota.findMany();
  res.json(trx);
});
app.post('/api/transaksi-anggota', async (req, res) => {
  const { anggotaId, jenis, nominal } = req.body;
  const trx = await prisma.transaksiAnggota.create({ data: { anggotaId, jenis, nominal: Number(nominal) } });
  res.json(trx);
});

// --- PINJAMAN ---
app.get('/api/pinjaman', async (req, res) => {
  const pinjaman = await prisma.pinjaman.findMany();
  res.json(pinjaman);
});

app.post('/api/pinjaman', async (req, res) => {
  try {
    const { anggotaId, nominalPinjaman, tenorBulan, tujuan } = req.body;
    const pinjaman = await prisma.pinjaman.create({
      data: { 
        anggotaId, 
        nominalPinjaman: parseFloat(nominalPinjaman) || 0, 
        tenorBulan: parseInt(tenorBulan) || 0, 
        tujuan, 
        status: 'Pengajuan' 
      }
    });
    res.json(pinjaman);
  } catch (e) {
    console.error('POST /api/pinjaman error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/pinjaman/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const pinjaman = await prisma.pinjaman.update({
    where: { id },
    data: { status }
  });
  res.json(pinjaman);
});

app.get('/api/transaksi-pinjaman', async (req, res) => {
  const trx = await prisma.transaksiPinjaman.findMany();
  res.json(trx);
});

app.post('/api/transaksi-pinjaman', async (req, res) => {
  try {
    const { pinjamanId, jenis, nominal, nominalDisetujui } = req.body;
    
    const nominalFinal = nominalDisetujui ? parseFloat(nominalDisetujui) : parseFloat(nominal) || 0;

    const trx = await prisma.transaksiPinjaman.create({
      data: { pinjamanId, jenis, nominal: nominalFinal }
    });
    
    // Jika transaksi adalah Pencairan, update status pinjaman menjadi Aktif
    // Jika ada perubahan nominal (nominalDisetujui), update nominalPinjaman agar terintegrasi dengan perhitungan angsuran
    if (jenis === 'Pencairan') {
      const updateData = { status: 'Aktif' };
      if (nominalDisetujui) {
        updateData.nominalPinjaman = nominalFinal;
      }
      await prisma.pinjaman.update({
        where: { id: pinjamanId },
        data: updateData
      });
    }
    
    // Jika transaksi adalah Pelunasan, update status pinjaman menjadi Lunas
    if (jenis === 'Pelunasan') {
      await prisma.pinjaman.update({
        where: { id: pinjamanId },
        data: { status: 'Lunas' }
      });
    }
    
    res.json(trx);
  } catch (e) {
    console.error('POST /api/transaksi-pinjaman error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// START SERVER
const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
  console.log(`Akses dari perangkat lain: http://192.168.0.199:${PORT}`);
});
