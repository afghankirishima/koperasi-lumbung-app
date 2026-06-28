import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Wallet, Landmark, ChevronDown, ChevronRight, Building } from 'lucide-react';
import './Sidebar.css';

const MenuItem = ({ icon: Icon, title, children, to, defaultOpen }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const location = useLocation();
  const isParentActive = children && location.pathname.startsWith(to);

  if (!children) {
    return (
      <NavLink to={to} className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
        <Icon size={20} />
        <span>{title}</span>
      </NavLink>
    );
  }

  return (
    <div className="sidebar-group">
      <div className={`sidebar-item ${isParentActive ? 'parent-active' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        <Icon size={20} />
        <span className="flex-1">{title}</span>
        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </div>
      {isOpen && <div className="sidebar-submenu">{children}</div>}
    </div>
  );
};

const SubMenuGroup = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="submenu-group">
      <div 
        className="submenu-group-title" 
        onClick={() => setIsOpen(!isOpen)}
        style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
      >
        <span style={{ flex: 1 }}>{title}</span>
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </div>
      {isOpen && <div className="submenu-group-content" style={{ display: 'flex', flexDirection: 'column' }}>{children}</div>}
    </div>
  );
};

export const Sidebar = ({ isMobileOpen, onClose }) => {
  return (
    <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-icon"><Building size={24} color="var(--primary-dark)" /></div>
        <div className="logo-text">
          <h3>Lumbung Artha</h3>
          <p>Koperasi Sejahtera</p>
        </div>
      </div>
      <div className="sidebar-nav">
        <MenuItem icon={LayoutDashboard} title="Dashboard" to="/dashboard" />
        <MenuItem icon={Users} title="Anggota" to="/anggota">
          <NavLink to="/anggota/registrasi" className={({isActive}) => `submenu-item ${isActive ? 'active' : ''}`}>Registrasi Anggota</NavLink>
          <SubMenuGroup title="Transaksi Anggota">
            <NavLink to="/anggota/transaksi/keluar" className="submenu-item">Anggota Keluar</NavLink>
            <NavLink to="/anggota/transaksi/approve-keluar" className="submenu-item">Approve Anggota Keluar</NavLink>
          </SubMenuGroup>
          {/* <NavLink to="/anggota/daftar-keluar" className={({isActive}) => `submenu-item ${isActive ? 'active' : ''}`}>Daftar Anggota Keluar</NavLink> */}
          <SubMenuGroup title="Laporan">
            <NavLink to="/anggota/laporan/profil" className="submenu-item">Profil Anggota</NavLink>
            <NavLink to="/anggota/laporan/keluar" className="submenu-item">Laporan Anggota Keluar</NavLink>
          </SubMenuGroup>
        </MenuItem>
        <MenuItem icon={Wallet} title="Tabungan" to="/tabungan">
          {/* <NavLink to="/tabungan/registrasi" className="submenu-item">Registrasi Rekening</NavLink> */}
          <SubMenuGroup title="Transaksi Tabungan">
            <NavLink to="/tabungan/transaksi/setoran" className="submenu-item">Setoran</NavLink>
            <NavLink to="/tabungan/transaksi/penarikan" className="submenu-item">Penarikan</NavLink>
            <NavLink to="/tabungan/transaksi/pindah-buku" className="submenu-item">Pindah Buku</NavLink>
          </SubMenuGroup>
          <SubMenuGroup title="Laporan">
            <NavLink to="/tabungan/laporan/registrasi" className="submenu-item">Laporan Registrasi</NavLink>
            <NavLink to="/tabungan/laporan/setoran" className="submenu-item">Laporan Setoran</NavLink>
            <NavLink to="/tabungan/laporan/penarikan" className="submenu-item">Laporan Penarikan</NavLink>
            <NavLink to="/tabungan/laporan/pindah-buku" className="submenu-item">Laporan Pindah Buku</NavLink>
            <NavLink to="/tabungan/laporan/saldo" className="submenu-item">Laporan Saldo Tabungan</NavLink>
            <NavLink to="/tabungan/laporan/statement" className="submenu-item">Laporan Statement</NavLink>
            <NavLink to="/tabungan/laporan/rekap" className="submenu-item">Laporan Rekap</NavLink>
          </SubMenuGroup>
        </MenuItem>
        <MenuItem icon={Landmark} title="Pinjaman" to="/pinjaman">
          <NavLink to="/pinjaman/pengajuan" className="submenu-item">Pengajuan Pinjaman</NavLink>
          <NavLink to="/pinjaman/registrasi" className="submenu-item">Approve Pinjaman</NavLink>
          <SubMenuGroup title="Transaksi Pinjaman">
            <NavLink to="/pinjaman/transaksi/pencairan" className="submenu-item">Pencairan Pinjaman</NavLink>
            <NavLink to="/pinjaman/transaksi/angsuran" className="submenu-item">Pembayaran Angsuran</NavLink>
            <NavLink to="/pinjaman/transaksi/pelunasan" className="submenu-item">Pelunasan Pinjaman</NavLink>
          </SubMenuGroup>
          <SubMenuGroup title="Laporan">
            <NavLink to="/pinjaman/laporan/pengajuan" className="submenu-item">Laporan Pengajuan</NavLink>
            <NavLink to="/pinjaman/laporan/pencairan" className="submenu-item">Laporan Pencairan</NavLink>
            <NavLink to="/pinjaman/laporan/angsuran" className="submenu-item">Kartu Angsuran</NavLink>
            <NavLink to="/pinjaman/laporan/saldo" className="submenu-item">Laporan Saldo Pinjaman</NavLink>
            <NavLink to="/pinjaman/laporan/pelunasan" className="submenu-item">Laporan Pelunasan</NavLink>
            <NavLink to="/pinjaman/laporan/rekap" className="submenu-item">Laporan Rekap</NavLink>
          </SubMenuGroup>
        </MenuItem>
      </div>
    </aside>
  );
};
