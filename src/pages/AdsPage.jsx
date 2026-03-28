import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AdsPage() {
  const [ads, setAds] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', platform: 'Facebook', start_date: '', end_date: '', total_spend: '' });
  const { user } = useAuth();
  const t = useTranslation();

  const load = async () => setAds((await api.get('shop/ads/')).data);
  useEffect(() => { load() }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('shop/ads/', form);
    setShowAdd(false);
    setForm({ name: '', platform: 'Facebook', start_date: '', end_date: '', total_spend: '' });
    load();
  };

  return (
    <div>
      <div className="print-area">
        <h1>{user?.business_name} - {t.ad_report}</h1>
        <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '20px'}}>
          <thead>
            <tr style={{borderBottom: '2px solid #000'}}>
              <th style={{padding:'8px', textAlign:'left'}}>Campaign</th>
              <th style={{padding:'8px', textAlign:'left'}}>Platform</th>
              <th style={{padding:'8px', textAlign:'right'}}>Spent</th>
              <th style={{padding:'8px', textAlign:'right'}}>Revenue</th>
              <th style={{padding:'8px', textAlign:'right'}}>P/L</th>
            </tr>
          </thead>
          <tbody>
            {ads.map(ad => (
              <tr key={ad.id} style={{borderBottom: '1px solid #ccc'}}>
                <td style={{padding:'8px'}}>{ad.name}</td>
                <td style={{padding:'8px'}}>{ad.platform}</td>
                <td style={{padding:'8px', textAlign:'right'}}>৳{ad.total_spend}</td>
                <td style={{padding:'8px', textAlign:'right'}}>৳{ad.revenue}</td>
                <td style={{padding:'8px', textAlign:'right'}}>{ad.revenue - ad.total_spend >= 0 ? '+' : '-'}৳{Math.abs(ad.revenue - ad.total_spend)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="no-print" style={{display:'flex', justifyContent:'space-between', marginBottom:'2rem'}}>
        <h2>বিজ্ঞাপন থেকে মুনাফার হিসাব</h2>
        <div style={{display:'flex', gap:'1rem'}}>
          <button className="btn-secondary" onClick={() => window.print()}>🖨️ Print Report</button>
          <button className="btn-primary" onClick={() => setShowAdd(!showAdd)}>
            {showAdd ? 'Cancel' : `+ Add Campaign`}
          </button>
        </div>
      </div>

      <div className="grid-cards" style={{marginBottom:'2rem', gridTemplateColumns:'repeat(auto-fit, minmax(400px, 1fr))'}}>
        <div className="glass-card">
          <h3 style={{marginBottom:'1rem'}}>খরচ বনাম আয় (৳)</h3>
          <Bar 
            data={{
              labels: ads.map(a => a.name),
              datasets: [
                {
                  label: 'মোট খরচ',
                  data: ads.map(a => a.total_spend),
                  backgroundColor: 'rgba(239, 68, 68, 0.7)',
                  borderRadius: 5
                },
                {
                  label: 'মোট আয়',
                  data: ads.map(a => a.revenue),
                  backgroundColor: 'rgba(16, 185, 129, 0.7)',
                  borderRadius: 5
                }
              ]
            }}
            options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }}
          />
        </div>
        <div className="glass-card" style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
          <h3 style={{marginBottom:'1rem'}}>মুনাফার হার (Success Rate)</h3>
          <div style={{width:'250px'}}>
            <Pie 
              data={{
                labels: ['খরচ', 'মুনাফা'],
                datasets: [{
                  data: [
                    ads.reduce((acc, a) => acc + parseFloat(a.total_spend), 0),
                    ads.reduce((acc, a) => acc + (parseFloat(a.revenue) - parseFloat(a.total_spend)), 0)
                  ],
                  backgroundColor: ['#EF4444', '#10B981'],
                  borderWidth: 0
                }]
              }}
              options={{ plugins: { legend: { position: 'bottom' } } }}
            />
          </div>
        </div>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="glass-card animate-slide-up" style={{marginBottom:'2rem'}}>
          <div className="grid-cards">
            <div className="form-group"><label>Campaign Name</label><input required className="input-field" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} /></div>
            <div className="form-group"><label>Platform</label>
              <select className="input-field" value={form.platform} onChange={e=>setForm({...form, platform:e.target.value})}>
                <option value="Facebook">Facebook</option>
                <option value="Google">Google / YouTube</option>
                <option value="TikTok">TikTok</option>
              </select>
            </div>
            <div className="form-group"><label>Total Ad Spend (৳)</label><input type="number" required className="input-field" value={form.total_spend} onChange={e=>setForm({...form, total_spend:e.target.value})} /></div>
            <div className="form-group"><label>Estimated Revenue (৳)</label><input type="number" required className="input-field" value={form.revenue} onChange={e=>setForm({...form, revenue:e.target.value})} /></div>
            <div className="form-group"><label>Start Date</label><input type="date" required className="input-field" value={form.start_date} onChange={e=>setForm({...form, start_date:e.target.value})} /></div>
            <div className="form-group"><label>End Date</label><input type="date" required className="input-field" value={form.end_date} onChange={e=>setForm({...form, end_date:e.target.value})} /></div>
          </div>
          <button type="submit" className="btn-primary" style={{marginTop:'1rem'}}>Save</button>
        </form>
      )}

      <div className="grid-cards">
        {ads.map(ad => (
          <div key={ad.id} className="glass-card animate-slide-up" style={{borderLeft:`4px solid var(--secondary)`}}>
            <h3 style={{marginBottom:'0.5rem', color:'var(--text-main)'}}>{ad.name}</h3>
            <p style={{color:'var(--text-muted)', fontSize:'0.9rem', marginBottom:'1rem'}}>Platform: {ad.platform}</p>
            
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem'}}>
              <span>Spent:</span>
              <span style={{fontWeight:'bold', color:'var(--danger)'}}>৳{ad.total_spend}</span>
            </div>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem'}}>
              <span>Revenue:</span>
              <span style={{fontWeight:'bold', color:'var(--success)'}}>৳{ad.revenue}</span>
            </div>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'1rem', borderTop:'1px solid var(--border-color)', paddingTop:'0.5rem'}}>
              <span>{ad.revenue - ad.total_spend >= 0 ? `${t.profit}:` : `${t.loss}:`}</span>
              <span style={{fontWeight:'bold', color: (ad.revenue - ad.total_spend) >= 0 ? 'var(--success)' : 'var(--danger)'}}>
                {(((ad.revenue - ad.total_spend) / ad.total_spend) * 100).toFixed(1)}% (৳{Math.abs(ad.revenue - ad.total_spend)})
              </span>
            </div>
            <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.85rem', color:'var(--text-muted)'}}>
              <span>{new Date(ad.start_date).toLocaleDateString()}</span>
              <span>to</span>
              <span>{new Date(ad.end_date).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
