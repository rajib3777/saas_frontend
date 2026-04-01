import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../context/LanguageContext';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const statusStyle = {
  delivered: { background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid #10B981' },
  returned:  { background: 'rgba(239,68,68,0.15)',  color: '#EF4444', border: '1px solid #EF4444'  },
  pending:   { background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid #F59E0B'  },
  in_transit: { background: 'rgba(59,130,246,0.15)', color: '#3B82F6', border: '1px solid #3B82F6' },
  out_for_delivery: { background: 'rgba(168,85,247,0.15)', color: '#A855F7', border: '1px solid #A855F7' },
  cancelled: { background: 'rgba(107,114,128,0.15)', color: '#6B7280', border: '1px solid #6B7280' },
};

export default function ParcelsPage() {
  const t = useTranslation();
  const { lang } = useLanguage();
  const { user } = useAuth();
  const isModerator = user?.role === 'moderator';

  const [parcels, setParcels] = useState([]);
  const [moderators, setModerators] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ courier_name: 'Steadfast', tracking_number: '', customer_name: '', cost_price: '', selling_price: '', status: 'pending' });

  // Filters
  const [filterStatus, setFilterStatus]   = useState('');
  const [filterDate,   setFilterDate]     = useState('');
  const [filterMod,    setFilterMod]      = useState('');

  const buildParams = () => {
    const params = {};
    if (filterStatus) params.status    = filterStatus;
    if (filterDate)   params.date      = filterDate;
    if (filterMod)    params.added_by  = filterMod;
    return params;
  };

  const load = async () => {
    const res = await api.get('shop/parcels/', { params: buildParams() });
    setParcels(res.data);
  };

  const loadModerators = async () => {
    try {
      const res = await api.get('employees/list/');
      setModerators(res.data.filter(e => e.has_account));
    } catch {}
  };

  useEffect(() => { load(); loadModerators(); }, []);
  useEffect(() => { load(); }, [filterStatus, filterDate, filterMod]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('shop/parcels/', form);
    setShowAdd(false);
    setForm({ courier_name: 'Steadfast', tracking_number: '', customer_name: '', cost_price: '', selling_price: '', status: 'pending' });
    load();
  };

  const updateStatus = async (id, status) => {
    if (isModerator) return; // moderators cannot edit
    await api.patch(`shop/parcels/${id}/`, { status });
    load();
  };

  const delivered = parcels.filter(p => p.status === 'delivered').length;
  const pending   = parcels.filter(p => p.status === 'pending').length;
  const returned  = parcels.filter(p => p.status === 'returned').length;
  const inTransit = parcels.filter(p => p.status === 'in_transit').length;
  const outForDel = parcels.filter(p => p.status === 'out_for_delivery').length;
  const cancelled = parcels.filter(p => p.status === 'cancelled').length;

  return (
    <div>
      {/* Print only area */}
      <div className="print-area">
        <h1>{user?.business_name} - {t.parcel_report}</h1>
        <table style={{width:'100%', borderCollapse:'collapse', marginTop:'20px'}}>
          <thead><tr style={{borderBottom:'2px solid #000'}}>
            <th style={{padding:'8px', textAlign:'left'}}>Date</th>
            <th style={{padding:'8px', textAlign:'left'}}>Customer</th>
            <th style={{padding:'8px', textAlign:'left'}}>Courier</th>
            <th style={{padding:'8px', textAlign:'left'}}>Added By</th>
            <th style={{padding:'8px', textAlign:'right'}}>Profit</th>
            <th style={{padding:'8px', textAlign:'center'}}>Status</th>
          </tr></thead>
          <tbody>
            {parcels.map(p => (
              <tr key={p.id} style={{borderBottom:'1px solid #ccc'}}>
                <td style={{padding:'8px'}}>{new Date(p.date).toLocaleDateString()}</td>
                <td style={{padding:'8px'}}>{p.customer_name}</td>
                <td style={{padding:'8px'}}>{p.courier_name} ({p.tracking_number})</td>
                <td style={{padding:'8px'}}>{p.added_by_name || '—'}</td>
                <td style={{padding:'8px', textAlign:'right'}}>{p.profit >= 0 ? '+' : '-'}৳{Math.abs(p.profit)}</td>
                <td style={{padding:'8px', textAlign:'center'}}>{p.status.toUpperCase()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Main UI */}
      <div className="no-print">
        {/* Header */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2rem', flexWrap:'wrap', gap:'1rem'}}>
          <h2 style={{margin:0}}>📦 {t.parcel_tracking}</h2>
          <div style={{display:'flex', gap:'1rem'}}>
            <button className="btn-secondary" onClick={() => window.print()}>🖨️ {lang === 'bn' ? 'প্রিন্ট' : 'Print'}</button>
            <button className="btn-primary" onClick={() => setShowAdd(!showAdd)}>
              {showAdd ? t.cancel : `+ ${t.add_parcel}`}
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid-cards" style={{marginBottom:'2rem', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))'}}>
          {[
            { label: t.delivered, count: delivered, color: '#10B981' },
            { label: t.pending,   count: pending,   color: '#F59E0B' },
            { label: t.in_transit, count: inTransit, color: '#3B82F6' },
            { label: t.out_for_delivery, count: outForDel, color: '#A855F7' },
            { label: t.returned,  count: returned,  color: '#EF4444' },
            { label: t.cancelled, count: cancelled, color: '#6B7280' },
            { label: t.total,     count: parcels.length, color: 'var(--primary)' },
          ].map(s => (
            <div key={s.label} className="glass-card animate-slide-up" style={{borderLeft:`4px solid ${s.color}`, padding:'1.2rem'}}>
              <div style={{color:'var(--text-muted)', fontSize:'0.8rem', textTransform:'uppercase', letterSpacing:'.5px'}}>{s.label}</div>
              <div style={{fontSize:'2rem', fontWeight:'800', color:s.color}}>{s.count}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="glass-card" style={{marginBottom:'2rem', padding:'1.2rem'}}>
          <h4 style={{marginBottom:'1rem', color:'var(--text-muted)'}}>{t.search_filter}</h4>
          <div className="grid-cards" style={{gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))'}}>
            <div className="form-group">
              <label>{t.status}</label>
              <select className="input-field" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
                <option value="">{t.all}</option>
                <option value="pending">{t.pending}</option>
                <option value="in_transit">{t.in_transit}</option>
                <option value="out_for_delivery">{t.out_for_delivery}</option>
                <option value="delivered">{t.delivered}</option>
                <option value="returned">{t.returned}</option>
                <option value="cancelled">{t.cancelled}</option>
              </select>
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" className="input-field" value={filterDate} onChange={e=>setFilterDate(e.target.value)} />
            </div>
            {!isModerator && (
              <div className="form-group">
                <label>{lang === 'bn' ? 'মডারেটর' : 'Moderator'}</label>
                <select className="input-field" value={filterMod} onChange={e=>setFilterMod(e.target.value)}>
                  <option value="">{t.all_moderators}</option>
                  {moderators.map(m => (
                    <option key={m.id} value={m.user_account_id}>{m.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="form-group" style={{display:'flex', alignItems:'flex-end'}}>
              <button className="btn-secondary" style={{width:'100%'}} onClick={()=>{setFilterStatus('');setFilterDate('');setFilterMod('');}}>{t.clear_filters}</button>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid-cards" style={{marginBottom:'2rem', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))'}}>
          <div className="glass-card" style={{display:'flex', flexDirection:'column', alignItems:'center', padding:'1.5rem'}}>
            <h3 style={{marginBottom:'1rem'}}>{t.status_distribution}</h3>
            <div style={{width:'240px'}}>
              <Pie data={{
                labels: [t.delivered, t.pending, t.in_transit, t.out_for_delivery, t.returned, t.cancelled],
                datasets: [{ data: [delivered, pending, inTransit, outForDel, returned, cancelled], backgroundColor: ['#10B981','#F59E0B','#3B82F6','#A855F7','#EF4444','#6B7280'] }]
              }} />
            </div>
          </div>
          <div className="glass-card" style={{padding:'1.5rem'}}>
            <h3 style={{marginBottom:'1rem'}}>{t.financial_summary}</h3>
            <Bar
              data={{
                labels: [t.total_cost, t.total_cod, t.net_profit],
                datasets: [{ label: t.amount, data: [
                  parcels.reduce((a,p) => a + parseFloat(p.cost_price||0), 0),
                  parcels.reduce((a,p) => a + parseFloat(p.selling_price||0), 0),
                  parcels.reduce((a,p) => a + parseFloat(p.profit||0), 0),
                ], backgroundColor: ['#6366F1','#34D399','#F472B6'] }]
              }}
              options={{ responsive: true, plugins: { legend: { display: false } } }}
            />
          </div>
        </div>

        {/* Add Form */}
        {showAdd && (
          <form onSubmit={handleSubmit} className="glass-card animate-slide-up" style={{marginBottom:'2rem'}}>
            <h3 style={{marginBottom:'1.2rem'}}>{t.add_parcel}</h3>
            {isModerator && (
              <div className="glass-card" style={{marginBottom:'1rem', padding:'0.75rem', background:'rgba(124,58,237,0.08)', borderLeft:'3px solid var(--primary)'}}>
                <small>📝 {t.added_by}: <strong>{user?.full_name}</strong> ({lang === 'bn' ? 'মডারেটর' : 'Moderator'})</small>
              </div>
            )}
            <div className="grid-cards">
              <div className="form-group"><label>{t.customer_name}</label><input required className="input-field" value={form.customer_name} onChange={e=>setForm({...form, customer_name:e.target.value})} /></div>
              <div className="form-group"><label>{t.courier_service_label}</label><input required className="input-field" value={form.courier_name} onChange={e=>setForm({...form, courier_name:e.target.value})} /></div>
              <div className="form-group"><label>{t.tracking_id}</label><input className="input-field" value={form.tracking_number} onChange={e=>setForm({...form, tracking_number:e.target.value})} /></div>
              <div className="form-group"><label>{t.buying_price_cost}</label><input type="number" required className="input-field" value={form.cost_price} onChange={e=>setForm({...form, cost_price:e.target.value})} /></div>
              <div className="form-group"><label>{t.cod_amount}</label><input type="number" required className="input-field" value={form.selling_price} onChange={e=>setForm({...form, selling_price:e.target.value})} /></div>
            </div>
            <button type="submit" className="btn-primary" style={{marginTop:'1rem'}}>{t.save}</button>
          </form>
        )}

        {/* Table */}
        <div className="glass-card" style={{overflowX:'auto'}}>
          <table className="data-table">
            <thead>
              <tr>
                <th>{t.date}</th><th>{t.customer_name}</th><th>{t.courier}</th><th>{t.added_by}</th><th>{t.profit}</th><th>{t.status}</th>
                {!isModerator && <th>{t.update_status}</th>}
              </tr>
            </thead>
            <tbody>
              {parcels.map(p => (
                <tr key={p.id}>
                  <td>{new Date(p.date).toLocaleDateString()}</td>
                  <td style={{fontWeight:'bold'}}>{p.customer_name}</td>
                  <td>{p.courier_name}<br/>
                    <small style={{color:'var(--text-muted)'}}>{p.tracking_number}</small>
                    {p.is_auto_tracking && p.last_sync_time && (
                      <div style={{fontSize:'0.75rem', color:'var(--primary)', marginTop:'4px'}}>
                        🔄 {t.last_synced}: {new Date(p.last_sync_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    )}
                  </td>
                  <td>
                    {p.added_by_name
                      ? <span style={{background:'rgba(124,58,237,0.15)', color:'var(--primary)', padding:'2px 8px', borderRadius:'10px', fontSize:'0.82rem'}}>{p.added_by_name}</span>
                      : <span style={{color:'var(--text-muted)'}}>{t.admin_label}</span>}
                  </td>
                  <td style={{color: p.profit >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight:'bold'}}>
                    {p.profit >= 0 ? '+' : ''}৳{parseFloat(p.profit).toFixed(2)}
                  </td>
                  <td>
                    <span style={{padding:'4px 10px', borderRadius:'12px', fontSize:'0.82rem', fontWeight:'bold', ...statusStyle[p.status]}}>
                      {p.status.toUpperCase()}
                    </span>
                  </td>
                  {!isModerator && (
                    <td>
                      <select disabled={p.is_auto_tracking} className="input-field" style={{padding:'4px 8px'}} value={p.status} onChange={e=>updateStatus(p.id, e.target.value)}>
                        <option value="pending">Pending</option>
                        <option value="in_transit">In Transit</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="returned">Returned</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      {p.is_auto_tracking && <div style={{fontSize:'0.7rem', color:'var(--primary)', marginTop:'4px'}}>Auto-tracking enabled</div>}
                    </td>
                  )}
                </tr>
              ))}
              {parcels.length === 0 && <tr><td colSpan="7" style={{textAlign:'center', padding:'2rem', color:'var(--text-muted)'}}>{lang === 'bn' ? 'কোনো পার্সেল পাওয়া যায়নি।' : 'No parcels found.'}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
