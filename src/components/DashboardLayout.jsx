import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../context/LanguageContext';
import { useState, useEffect } from 'react';

const NavItem = ({ to, label, icon }) => {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link 
      to={to} 
      style={{
        display:'block', padding:'1rem', textDecoration:'none', 
        color: active ? 'white' : 'var(--text-muted)',
        background: active ? 'var(--primary)' : 'transparent',
        borderRadius: '8px', marginBottom: '0.5rem',
        fontWeight: active ? 'bold' : 'normal',
        transition: 'all 0.2s'
      }}
    >
      {icon} {label}
    </Link>
  );
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const t = useTranslation();
  const { toggleLang, lang } = useLanguage();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isSidebarOpen]);

  const isShop = user?.subscription_type === 'shop';
  const isModerator = user?.role === 'moderator';


  return (
    <div className="app-container">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', zIndex:999}}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <h2 style={{color: 'var(--primary)', marginBottom: '2rem', textAlign:'center', marginTop:0}}>{t.brand_name}</h2>
        
        <div className="sidebar-nav" style={{flex: 1, overflowY: 'auto', marginBottom: '1rem', paddingRight: '0.5rem'}}>
          <NavItem to="/dashboard" label={t.dashboard} icon="📊" />
          {!isModerator && <NavItem to="/dashboard/employees" label={t.employees} icon="👥" />}
          
          {user?.subscription_type === 'office' && !isModerator && (
            <NavItem to="/dashboard/clients" label={t.clients} icon="🏢" />
          )}

          {isShop && (
            <>
              {!isModerator && <NavItem to="/dashboard/inventory" label={t.inventory} icon="📦" />}
              {!isModerator && <NavItem to="/dashboard/sales" label={t.sales} icon="💰" />}
              <NavItem to="/dashboard/parcels" label={t.parcels} icon="🚚" />
              {!isModerator && <NavItem to="/dashboard/ads" label={t.ads} icon="📢" />}
              {!isModerator && <NavItem to="/dashboard/withdrawals" label={t.withdrawals} icon="💳" />}
            </>
          )}
        </div>

        <div className="sidebar-footer" style={{borderTop: '1px solid var(--border-color)', paddingTop: '1rem'}}>
          <div className="user-info" style={{marginBottom:'1rem', color:'var(--text-muted)', fontSize:'0.9rem'}}>
            👤 {user?.full_name}<br/>
            🏷️ {user?.subscription_type.toUpperCase()}
          </div>
          <button onClick={toggleLang} className="btn-secondary" style={{width:'100%', marginBottom:'0.5rem'}}>
            {lang === 'en' ? 'বাংলা' : 'English'}
          </button>
          <button onClick={logout} className="btn-secondary" style={{width:'100%', borderColor:'var(--danger)', color:'var(--danger)'}}>
            {t.logout}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Mobile Header for Hamburger */}
        <div className="dashboard-mobile-header" style={{display:'none', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
          <h2 style={{color:'var(--primary)', margin:0, fontSize:'1.5rem'}}>{t.brand_name}</h2>
          <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{display:'block', fontSize:'1.8rem'}}>
            {isSidebarOpen ? '✕' : '☰'}
          </button>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
