import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, Title, Tooltip, Legend
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const BN_MONTHS = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
const COURIERS = ['Pathao', 'Steadfast', 'Redx', 'eCourier', 'Paperfly', 'Other'];
const BN_COURIERS = ['পাঠাও', 'স্টিডফাস্ট', 'রেডক্স', 'ই-কুরিয়ার', 'পেপারফ্লাই', 'অন্যান্য'];

export default function CourierWithdrawalsPage() {
  const { user } = useAuth();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const [withdrawals, setWithdrawals] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ courier_name: '', amount: '', date: new Date().toISOString().split('T')[0] });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const load = async () => {
    try {
      const res = await api.get('shop/courier-withdrawals/', { params: { year, month } });
      setWithdrawals(res.data);
    } catch {}
  };

  useEffect(() => { load(); }, [year, month]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('shop/courier-withdrawals/', form);
      setShowAdd(false);
      setForm({ courier_name: '', amount: '', date: new Date().toISOString().split('T')[0] });
      load();
    } catch {}
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t.delete_confirm)) return;
    await api.delete(`shop/courier-withdrawals/${id}/`);
    load();
  };

  // Build chart data — group by courier
  const courierTotals = {};
  withdrawals.forEach(w => {
    courierTotals[w.courier_name] = (courierTotals[w.courier_name] || 0) + parseFloat(w.amount);
  });
  const chartLabels = Object.keys(courierTotals);
  const chartData   = Object.values(courierTotals);

  // Daily timeline
  const byDate = {};
  withdrawals.forEach(w => {
    byDate[w.date] = (byDate[w.date] || 0) + parseFloat(w.amount);
  });
  const sortedDates = Object.keys(byDate).sort();

  const totalAmount = withdrawals.reduce((a, w) => a + parseFloat(w.amount), 0);
  const yearOptions = [now.getFullYear()-1, now.getFullYear(), now.getFullYear()+1];

  return (
    <div>
      {/* Header */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2rem', flexWrap:'wrap', gap:'1rem'}}>
        <div>
          <h2 style={{margin:0}}>💳 {t.courier_withdrawals_title}</h2>
          <p style={{color:'var(--text-muted)', margin:'0.25rem 0 0'}}>{t.track_cash_msg}</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? t.cancel : `+ ${t.add_entry}`}
        </button>
      </div>

      {/* Year / Month Selector */}
      <div className="glass-card" style={{marginBottom:'2rem', padding:'1.2rem', display:'flex', gap:'1rem', flexWrap:'wrap', alignItems:'center'}}>
        <div className="form-group" style={{margin:0}}>
          <label>{t.year_label}</label>
          <select className="input-field" value={year} onChange={e=>setYear(+e.target.value)}>
            {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="form-group" style={{margin:0}}>
          <label>{t.month_label}</label>
          <select className="input-field" value={month} onChange={e=>setMonth(+e.target.value)}>
            {MONTHS.map((m,i) => <option key={i+1} value={i+1}>{lang === 'bn' ? BN_MONTHS[i] : m}</option>)}
          </select>
        </div>
        <div style={{marginLeft:'auto', textAlign:'right'}}>
          <div style={{color:'var(--text-muted)', fontSize:'0.85rem'}}>{t.total_this_month}</div>
          <div style={{fontSize:'1.8rem', fontWeight:'800', color:'var(--primary)'}}>৳{totalAmount.toFixed(2)}</div>
        </div>
      </div>

      {/* Add Form */}
      {showAdd && (
        <form onSubmit={handleSubmit} className="glass-card animate-slide-up" style={{marginBottom:'2rem'}}>
          <h3 style={{marginBottom:'1.2rem'}}>{t.new_withdrawal_entry}</h3>
          <div className="grid-cards">
            <div className="form-group">
              <label>{t.courier_service_label}</label>
              <select required className="input-field" value={form.courier_name} onChange={e=>setForm({...form, courier_name:e.target.value})}>
                <option value="">{t.select_option}</option>
                {COURIERS.map((c, i) => <option key={c} value={c}>{lang === 'bn' ? BN_COURIERS[i] : c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>{t.amount} (৳)</label>
              <input type="number" required className="input-field" value={form.amount} min={1} onChange={e=>setForm({...form, amount:e.target.value})} />
            </div>
            <div className="form-group">
              <label>{t.date}</label>
              <input type="date" required className="input-field" value={form.date} onChange={e=>setForm({...form, date:e.target.value})} />
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{marginTop:'1rem'}} disabled={saving}>
            {saving ? t.saving_msg : t.save_entry}
          </button>
        </form>
      )}

      {/* Charts */}
      {withdrawals.length > 0 && (
        <div className="grid-cards" style={{marginBottom:'2rem', gridTemplateColumns:'repeat(auto-fit, minmax(340px, 1fr))'}}>
          <div className="glass-card animate-slide-up" style={{padding:'1.5rem'}}>
            <h3 style={{marginBottom:'1rem'}}>{t.by_courier}</h3>
            <Bar
              data={{
                labels: chartLabels.map(l => {
                   const idx = COURIERS.indexOf(l);
                   return (lang === 'bn' && idx !== -1) ? BN_COURIERS[idx] : l;
                }),
                datasets: [{
                  label: t.total_withdrawn,
                  data: chartData,
                  backgroundColor: ['#7C3AED','#10B981','#F59E0B','#6366F1','#EC4899','#14B8A6'],
                  borderRadius: 6,
                }]
              }}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
              }}
            />
          </div>

          <div className="glass-card animate-slide-up" style={{padding:'1.5rem'}}>
            <h3 style={{marginBottom:'1rem'}}>{t.daily_trend}</h3>
            <Line
              data={{
                labels: sortedDates,
                datasets: [{
                  label: t.daily_amount,
                  data: sortedDates.map(d => byDate[d]),
                  borderColor: '#7C3AED',
                  backgroundColor: 'rgba(124,58,237,0.1)',
                  fill: true,
                  tension: 0.4,
                }]
              }}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
              }}
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="glass-card" style={{overflowX:'auto'}}>
        <table className="data-table">
          <thead>
            <tr>
              <th>{t.date}</th><th>{t.courier}</th><th>{t.amount} (৳)</th><th>{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.map(w => (
              <tr key={w.id}>
                <td>{w.date}</td>
                <td>
                  <span style={{background:'rgba(124,58,237,0.15)', color:'var(--primary)', padding:'3px 10px', borderRadius:'10px', fontSize:'0.85rem', fontWeight:'bold'}}>
                    {(() => {
                        const idx = COURIERS.indexOf(w.courier_name);
                        return (lang === 'bn' && idx !== -1) ? BN_COURIERS[idx] : w.courier_name;
                    })()}
                  </span>
                </td>
                <td style={{fontWeight:'bold', fontSize:'1.05rem', color:'var(--success)'}}>৳{parseFloat(w.amount).toLocaleString()}</td>
                <td>
                  <button onClick={() => handleDelete(w.id)} style={{background:'rgba(239,68,68,0.1)', color:'#EF4444', border:'1px solid #EF4444', padding:'4px 10px', borderRadius:'6px', cursor:'pointer', fontSize:'0.82rem'}}>
                    {lang === 'bn' ? 'মুছুন' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
            {withdrawals.length === 0 && (
              <tr><td colSpan="4" style={{textAlign:'center', padding:'3rem', color:'var(--text-muted)'}}>
                {t.no_entries_msg} {lang === 'bn' ? BN_MONTHS[month-1] : MONTHS[month-1]} {year}. {t.click_add_start}
              </td></tr>
            )}
          </tbody>
        </table>
        {withdrawals.length > 0 && (
          <div style={{padding:'1rem 1.5rem', borderTop:'1px solid var(--border-color)', display:'flex', justifyContent:'flex-end'}}>
            <strong style={{fontSize:'1.1rem'}}>{t.monthly_total} <span style={{color:'var(--primary)'}}>৳{totalAmount.toFixed(2)}</span></strong>
          </div>
        )}
      </div>
    </div>
  );
}
