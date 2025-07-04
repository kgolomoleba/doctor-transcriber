import React from 'react';
import { FaHome, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';

export default function Sidebar({ activePage, onNavigate }) {
  return (
    <nav className="sidebar">
      <div className="sidebarLogo">
        <span>🍔 Burger Troops</span>
      </div>

      <div
        className={`sidebarLink ${activePage === 'home' ? 'sidebarLinkActive' : ''}`}
        onClick={() => onNavigate('home')}
      >
        <FaHome />
        <span>Home</span>
      </div>

      <div
        className={`sidebarLink ${activePage === 'orders' ? 'sidebarLinkActive' : ''}`}
        onClick={() => onNavigate('orders')}
      >
        <FaUser />
        <span>Orders</span>
      </div>

      <div
        className={`sidebarLink ${activePage === 'settings' ? 'sidebarLinkActive' : ''}`}
        onClick={() => onNavigate('settings')}
      >
        <FaCog />
        <span>Settings</span>
      </div>

      <div
        className="sidebarLink sidebarLogout"
        onClick={() => onNavigate('logout')}
      >
        <FaSignOutAlt />
        <span>Logout</span>
      </div>
    </nav>
  );
}
