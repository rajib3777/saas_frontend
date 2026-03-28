import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function ParcelsPage() {
  const t = useTranslation();
  const { user } = useAuth();
  const [parcels, setParcels] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ courier_name: '', tracking_number: '', customer_name: '', cost_price: '', selling_price: '', status: 'pending' });

  const load = async () => setParcels((await api.get('shop/parcels/')).data);
  useEffect(() => { load() }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('shop/parcels/', form);
    setShowAdd(false);
    setForm({ courier_name: '', tracking_number: '', customer_name: '', cost_price: '', selling_price: '', status: 'pending' });
    load();
  };

  const updateStatus = async (id, status) => {
    await api.patch(`shop/parcels/${id}/`, { status });
    load();
  };

  return (
    <div>
      <div className="print-area">
        <h1>{user?.business_name} - {t.parcel_report}</h1>
        <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '20px'}}>
          <thead>
            <tr style={{borderBottom: '2px solid #000'}}>
              <th style={{padding:'8px', textAlign:'left'}}>ID & Date</th>
              <th style={{padding:'8px', textAlign:'left'}}>Customer</th>
              <th style={{padding:'8px', textAlign:'left'}}>Courier</th>
              <th style={{padding:'8px', textAlign:'right'}}>Profit/Loss</th>
              <th style={{padding:'8px', textAlign:'center'}}>Status</th>
            </tr>
          </thead>
          <tbody>
            {parcels.map(p => (
              <tr key={p.id} style={{borderBottom: '1px solid #ccc'}}>
                <td style={{padding:'8px'}}>{new Date(p.date).toLocaleDateString()}</td>
                <td style={{padding:'8px'}}>{p.customer_name}</td>
                <td style={{padding:'8px'}}>{p.courier_name} ({p.tracking_number})</td>
                <td style={{padding:'8px', textAlign:'right'}}>{p.profit >= 0 ? '+' : '-'}৳{Math.abs(p.profit)}</td>
                <td style={{padding:'8px', textAlign:'center'}}>{p.status.toUpperCase()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="no-print" style={{display:'flex', justifyContent:'space-between', marginBottom:'2rem'}}>
        <h2>E-commerce Parcel Tracking</h2>
        <div style={{display:'flex', gap:'1rem'}}>
          <button className="btn-secondary" onClick={() => window.print()}>🖨️ Print Report</button>
          <button className="btn-primary" onClick={() => setShowAdd(!showAdd)}>
            {showAdd ? t.cancel : `+ Add Parcel`}
          </button>
        </div>
      </div>

      <div className="grid-cards" style={{marginBottom:'2rem', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))'}}>
        <div className="glass-card" style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
          <h3 style={{marginBottom:'1rem'}}>Delivery Status Distribution</h3>
          <div style={{width:'250px'}}>
            <Pie 
              data={{
                labels: ['Pending', 'Delivered', 'Returned'],
                datasets: [{
                  data: [
                    parcels.filter(p => p.status === 'pending').length,
                    parcels.filter(p => p.status === 'delivered').length,
                    parcels.filter(p => p.status === 'returned').length,
                  ],
                  backgroundColor: ['#F59E0B', '#10B981', '#EF4444']
                }]
              }}
            />
          </div>
        </div>
        <div className="glass-card">
          <h3 style={{marginBottom:'1rem'}}>Financial Summary (৳)</h3>
          <Bar 
            data={{
              labels: ['Total Cost', 'Total COD', 'Net Profit'],
              datasets: [{
                label: 'Amount',
                data: [
                  parcels.reduce((acc, p) => acc + parseFloat(p.cost_price), 0),
                  parcels.reduce((acc, p) => acc + parseFloat(p.selling_price), 0),
                  parcels.reduce((acc, p) => acc + parseFloat(p.profit), 0),
                ],
                backgroundColor: ['#6366F1', '#34D399', '#F472B6']
              }]
            }}
            options={{ responsive: true, plugins: { legend: { display: false } } }}
          />
        </div>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="glass-card animate-slide-up" style={{marginBottom:'2rem'}}>
          <div className="grid-cards">
            <div className="form-group"><label>Customer Name</label><input required className="input-field" value={form.customer_name} onChange={e=>setForm({...form, customer_name:e.target.value})} /></div>
            <div className="form-group"><label>Courier Service</label><input required className="input-field" value={form.courier_name} onChange={e=>setForm({...form, courier_name:e.target.value})} /></div>
            <div className="form-group"><label>Tracking ID</label><input className="input-field" value={form.tracking_number} onChange={e=>setForm({...form, tracking_number:e.target.value})} /></div>
            <div className="form-group"><label>Cost (Product + Delivery)</label><input type="number" required className="input-field" value={form.cost_price} onChange={e=>setForm({...form, cost_price:e.target.value})} /></div>
            <div className="form-group"><label>COD Amount (Selling)</label><input type="number" required className="input-field" value={form.selling_price} onChange={e=>setForm({...form, selling_price:e.target.value})} /></div>
          </div>
          <button type="submit" className="btn-primary" style={{marginTop:'1rem'}}>{t.save}</button>
        </form>
      )}

      <div className="glass-card" style={{overflowX:'auto'}}>
        <div className="table-responsive">
          <table className="data-table">
          <thead>
            <tr>
              <th>Date</th><th>Customer</th><th>Courier</th><th>Est. Profit</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {parcels.map(p => (
              <tr key={p.id}>
                <td>{new Date(p.date).toLocaleDateString()}</td>
                <td style={{fontWeight:'bold'}}>{p.customer_name}</td>
                <td>{p.courier_name} <br/><small style={{color:'var(--text-muted)'}}>{p.tracking_number}</small></td>
                <td style={{color: p.profit >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight:'bold'}}>
                  {p.profit >= 0 ? `${t.profit}: ` : `${t.loss}: `}৳{Math.abs(p.profit).toFixed(2)}
                </td>
                <td>
                  <span style={{
                    padding:'4px 10px', borderRadius:'12px', fontSize:'0.85rem', fontWeight:'bold',
                    background: p.status === 'delivered' ? 'rgba(16,185,129,0.2)' : p.status === 'returned' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)',
                    color: p.status === 'delivered' ? '#10B981' : p.status === 'returned' ? '#EF4444' : '#F59E0B'
                  }}>
                    {p.status.toUpperCase()}
                  </span>
                </td>
                <td>
                  <select className="input-field" style={{padding:'4px 8px'}} value={p.status} onChange={(e)=>updateStatus(p.id, e.target.value)}>
                    <option value="pending">Pending</option>
                    <option value="delivered">Delivered</option>
                    <option value="returned">Returned</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
