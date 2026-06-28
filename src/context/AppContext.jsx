import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AppContext = createContext();

const API_URL = '/api';

// Bypass ngrok browser warning page for API calls

axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true';


export const AppProvider = ({ children }) => {
  const [data, setData] = useState({
    anggota: [],
    tabungan: [],
    transaksiTabungan: [],
    transaksiAnggota: [],
    pinjaman: [],
    transaksiPinjaman: []
  });

  const fetchData = async () => {
    try {
      const [ang, tab, trxTab, trxAng, pinj, trxPinj] = await Promise.all([
        axios.get(`${API_URL}/anggota`),
        axios.get(`${API_URL}/tabungan`),
        axios.get(`${API_URL}/transaksi-tabungan`),
        axios.get(`${API_URL}/transaksi-anggota`),
        axios.get(`${API_URL}/pinjaman`),
        axios.get(`${API_URL}/transaksi-pinjaman`),
      ]);
      setData({
        anggota: ang.data,
        tabungan: tab.data,
        transaksiTabungan: trxTab.data,
        transaksiAnggota: trxAng.data,
        pinjaman: pinj.data,
        transaksiPinjaman: trxPinj.data
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- ANGGOTA ---
  // const addAnggota = async (anggotaBaru) => {
  //   await axios.post(`${API_URL}/anggota`, anggotaBaru);
  //   fetchData();
  // };
  const addAnggota = async (formData) => {
    const res = await axios.post(`${API_URL}/anggota`, formData);
    // console.log('Response dari backend:', res.data); // hapus setelah confirmed
    
    // res.data sekarang = { anggota, tabungan }
    await fetchData(); // tarik ulang semua tabel sekaligus
    return res.data.anggota;
  };

  const updateAnggota = async (id, updatedData) => {
    await axios.put(`${API_URL}/anggota/${id}`, updatedData);
    fetchData();
  };

  const updateAnggotaStatus = async (id, status) => {
    await axios.put(`${API_URL}/anggota/${id}/status`, { status });
    fetchData();
  };

  const setAnggotaKeluar = async (id, alasan) => {
    await axios.put(`${API_URL}/anggota/${id}/status`, { status: 'Pending Keluar', alasan });
    fetchData();
  };

  const approveAnggotaKeluar = async (id) => {
    await axios.put(`${API_URL}/anggota/${id}/status`, { status: 'Keluar' });
    fetchData();
  };

  const updateAnggotaSbu = async (id, sbu) => {
    await axios.put(`${API_URL}/anggota/${id}/sbu`, { sbu });
    fetchData();
  };

  const deleteAnggota = async (id) => {
    await axios.delete(`${API_URL}/anggota/${id}`);
    fetchData();
  };

  // --- TABUNGAN ---
  const addTabungan = async (tabunganBaru) => {
    const res = await axios.post(`${API_URL}/tabungan`, tabunganBaru);
    fetchData();
    return res.data;
  };

  const updateTabungan = async (id, updatedData) => {
    await axios.put(`${API_URL}/tabungan/${id}`, updatedData);
    fetchData();
  };

  const deleteTabungan = async (id) => {
    await axios.delete(`${API_URL}/tabungan/${id}`);
    fetchData();
  };

  const addTransaksiTabungan = async (transaksi) => {
    await axios.post(`${API_URL}/transaksi-tabungan`, transaksi);
    fetchData();
  };

  const addTransaksiAnggota = async (transaksi) => {
    await axios.post(`${API_URL}/transaksi-anggota`, transaksi);
    fetchData();
  };

  // --- PINJAMAN ---
  const addPengajuanPinjaman = async (pengajuan) => {
    await axios.post(`${API_URL}/pinjaman`, pengajuan);
    fetchData();
  };

  const updateStatusPinjaman = async (id, status, extraData = {}) => {
    await axios.put(`${API_URL}/pinjaman/${id}/status`, { status, ...extraData });
    fetchData();
  };

  const addTransaksiPinjaman = async (transaksi) => {
    await axios.post(`${API_URL}/transaksi-pinjaman`, transaksi);
    fetchData();
  };

  return (
    <AppContext.Provider value={{
      data,
      setData,
      addAnggota,
      updateAnggota,
      deleteAnggota,
      updateAnggotaStatus,
      setAnggotaKeluar,
      approveAnggotaKeluar,
      updateAnggotaSbu,
      addTabungan,
      updateTabungan,
      deleteTabungan,
      addTransaksiTabungan,
      addTransaksiAnggota,
      addPengajuanPinjaman,
      updateStatusPinjaman,
      addTransaksiPinjaman
    }}>
      {children}
    </AppContext.Provider>
  );
};
