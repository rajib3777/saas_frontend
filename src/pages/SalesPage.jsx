import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function SalesPage() {
  const t = useTranslation();
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ product: '', quantity: '', selling_price: '', buying_price: '' });
  const { user } = useAuth();
  const [printData, setPrintData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // Default to current YYYY-MM

  const handlePrint = (sale) => {
    setPrintData(sale);
    setTimeout(() => {
      window.print();
      setPrintData(null);
    }, 500);
  };

  const load = async () => {
    setSales((await api.get('shop/sales/')).data);
    setProducts((await api.get('shop/products/')).data);
  };
  useEffect(() => { load() }, []);

  const handeProductChange = (e) => {
    const pId = e.target.value;
    const prod = products.find(p => p.id == pId);
    if(prod) {
      setForm({ ...form, product: pId, selling_price: prod.selling_price, buying_price: prod.buying_price });
    } else {
      setForm({ ...form, product: '', selling_price: '', buying_price: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('shop/sales/', form);
    setShowAdd(false);
    setForm({ product: '', quantity: '', selling_price: '', buying_price: '' });
    load();
  };

  const filteredSales = selectedMonth 
    ? sales.filter(s => s.date.startsWith(selectedMonth))
    : sales;

  return (
    <div>
      {printData && (
        <div className="print-area">
          <div style={{textAlign: 'center', marginBottom: '2rem'}}>
            <h1 style={{color:'black'}}>{user?.business_name}</h1>
            <p>{t.sales_invoice}</p>
          </div>
          <div style={{marginBottom: '2rem'}}>
            <p><strong>{t.date}:</strong> {new Date(printData.date).toLocaleDateString()}</p>
            <p><strong>{t.invoice_no}:</strong> #SALE-{printData.id}</p>
          </div>
          <table style={{width: '100%', borderCollapse: 'collapse', marginBottom: '2rem'}}>
            <thead>
              <tr style={{borderBottom: '2px solid #000'}}>
                <th style={{textAlign:'left', padding:'8px'}}>{t.item_desc}</th>
                <th style={{textAlign:'center', padding:'8px'}}>{t.qty}</th>
                <th style={{textAlign:'right', padding:'8px'}}>{t.price}</th>
                <th style={{textAlign:'right', padding:'8px'}}>{t.total}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{padding:'8px'}}>{printData.product_name}</td>
                <td style={{textAlign:'center', padding:'8px'}}>{printData.quantity}</td>
                <td style={{textAlign:'right', padding:'8px'}}>৳{printData.selling_price}</td>
                <td style={{textAlign:'right', padding:'8px'}}>৳{(printData.selling_price * printData.quantity).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          <div style={{textAlign: 'right'}}>
            <h3>{t.grand_total}: ৳{(printData.selling_price * printData.quantity).toFixed(2)}</h3>
          </div>
          <div style={{marginTop: '4rem', textAlign: 'center', fontSize: '0.9rem'}}>
            <p>{t.thank_you}</p>
          </div>
        </div>
      )}

      <div className="no-print" style={{display:'flex', justifyContent:'space-between', marginBottom:'2rem', flexWrap:'wrap', gap:'1rem'}}>
        <h2>{t.profit_loss} {t.sales_analytics}</h2>
        <div style={{display:'flex', gap:'1rem', flexWrap:'wrap', alignItems:'center'}}>
          <input 
            type="month" 
            className="input-field" 
            style={{padding:'0.5rem', margin:'0'}}
            value={selectedMonth} 
            onChange={e => setSelectedMonth(e.target.value)} 
          />
          <div className="glass-card" style={{padding:'0.5rem 1.5rem', display:'flex', alignItems:'center', gap:'1rem'}}>
            <span style={{fontSize:'0.9rem', color:'var(--text-muted)'}}>{t.profit_loss}:</span>
            <span style={{fontWeight:'bold', color:'var(--success)', fontSize:'1.2rem'}}>৳{filteredSales.reduce((acc,s)=>acc+s.profit, 0).toFixed(2)}</span>
          </div>
          <button className="btn-primary" onClick={() => setShowAdd(!showAdd)}>
            {showAdd ? t.cancel : `+ ${t.record_sale}`}
          </button>
        </div>
      </div>

      <div className="glass-card" style={{marginBottom:'2rem', padding:'1.5rem'}}>
        <h3 style={{marginBottom:'1rem'}}>{t.daily_profit_trend}</h3>
        <div style={{height:'350px'}}>
          <Line 
            data={{
              labels: [...new Set(filteredSales.map(s => s.date))].sort().map(d => new Date(d).toLocaleDateString()),
              datasets: [{
                label: `${t.profit} (৳)`,
                data: [...new Set(filteredSales.map(s => s.date))].sort().map(date => {
                   return filteredSales.filter(s => s.date === date).reduce((acc, s) => acc + s.profit, 0);
                }),
                borderColor: '#8B5CF6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: '#8B5CF6'
              }]
            }}
            options={{ 
              responsive: true, 
              maintainAspectRatio: false,
              plugins: {
                legend: { position: 'top' }
              }
            }}
          />
        </div>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="glass-card animate-slide-up" style={{marginBottom:'2rem'}}>
          <div className="grid-cards">
            <div className="form-group"><label>{t.select_product_label}</label>
              <select required className="input-field" value={form.product} onChange={handeProductChange}>
                <option value="">{t.choose_option}</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} ({t.stock_label}: {p.stock})</option>)}
              </select>
            </div>
            <div className="form-group"><label>{t.qty_sold}</label><input type="number" required className="input-field" value={form.quantity} onChange={e=>setForm({...form, quantity:e.target.value})} /></div>
            <div className="form-group"><label>{t.selling_price_label} ({lang === 'bn' ? 'প্রতি ইউনিট' : 'per unit'})</label><input type="number" required className="input-field" value={form.selling_price} onChange={e=>setForm({...form, selling_price:e.target.value})} /></div>
            <div className="form-group"><label>{t.cost_price_ref}</label><input type="number" disabled className="input-field" value={form.buying_price} /></div>
          </div>
          <button type="submit" className="btn-primary" style={{marginTop:'1rem'}}>{t.save}</button>
        </form>
      )}

      <div className="glass-card" style={{overflowX:'auto'}}>
        <div className="table-responsive">
          <table className="data-table">
          <thead>
            <tr>
              <th>{t.date}</th><th>{t.product}</th><th>{t.qty}</th><th>{t.sold_at}</th><th>{t.total_revenue}</th><th>{t.profit_loss}</th><th>{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.map(s => (
              <tr key={s.id}>
                <td>{new Date(s.date).toLocaleDateString()}</td><td style={{fontWeight:'bold'}}>{s.product_name}</td>
                <td>{s.quantity}</td><td>৳{s.selling_price}</td>
                <td style={{color:'var(--secondary)'}}>৳{(s.selling_price * s.quantity).toFixed(2)}</td>
                <td style={{color: s.profit >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight:'bold'}}>
                  {s.profit >= 0 ? `${t.profit}: ` : `${t.loss}: `}৳{Math.abs(s.profit).toFixed(2)}
                </td>
                <td>
                  <button className="btn-secondary" style={{padding:'4px 10px', fontSize:'0.8rem'}} onClick={() => handlePrint(s)}>🖨️ {lang === 'bn' ? 'প্রিন্ট' : 'Print'}</button>
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
