import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../context/AuthContext';

export default function InventoryPage() {
  const t = useTranslation();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', buying_price: '', selling_price: '' });
  const [imageFile, setImageFile] = useState(null);
  const [stockForm, setStockForm] = useState({ product: '', quantity: '' });

  const load = async () => setProducts((await api.get('shop/products/')).data);
  useEffect(() => { load() }, []);

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('buying_price', form.buying_price);
    formData.append('selling_price', form.selling_price);
    if (imageFile) {
      formData.append('image', imageFile);
    }
    
    await api.post('shop/products/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    setShowAdd(false);
    setForm({ name: '', buying_price: '', selling_price: '' });
    setImageFile(null);
    load();
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    // Ensure quantity is sent as a Number to avoid potential 500 errors in the backend
    const payload = {
        ...stockForm,
        quantity: Number(stockForm.quantity)
    };
    await api.post('shop/stock/', payload);
    setStockForm({ product: '', quantity: '' });
    alert('Stock updated successfully!');
    load();
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    // Derive base URL from VITE_API_URL (removes /api/ suffix)
    const baseUrl = import.meta.env.VITE_API_URL.split('/api/')[0];
    return `${baseUrl}${path}`;
  };

  return (
    <div>
      <div className="print-area">
        <h1>{user?.business_name} - {t.inventory_report}</h1>
        <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '20px'}}>
          <thead>
            <tr style={{borderBottom: '2px solid #000'}}>
              <th style={{padding:'8px', textAlign:'left'}}>Product Name</th>
              <th style={{padding:'8px', textAlign:'right'}}>Cost Price</th>
              <th style={{padding:'8px', textAlign:'right'}}>Selling Price</th>
              <th style={{padding:'8px', textAlign:'right'}}>Current Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} style={{borderBottom: '1px solid #ccc'}}>
                <td style={{padding:'8px'}}>{p.name}</td>
                <td style={{padding:'8px', textAlign:'right'}}>৳{p.buying_price}</td>
                <td style={{padding:'8px', textAlign:'right'}}>৳{p.selling_price}</td>
                <td style={{padding:'8px', textAlign:'right', fontWeight:'bold'}}>{p.stock} units</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="no-print" style={{display:'flex', justifyContent:'space-between', marginBottom:'2rem'}}>
        <h2>{t.inventory} Management</h2>
        <div style={{display:'flex', gap:'1rem'}}>
          <button className="btn-secondary" onClick={() => window.print()}>🖨️ Print Report</button>
          <button className="btn-primary" onClick={() => setShowAdd(!showAdd)}>
            {showAdd ? t.cancel : `+ Add Product`}
          </button>
        </div>
      </div>

      <div style={{display:'flex', gap:'2rem', alignItems:'flex-start'}}>
        {showAdd && (
          <form onSubmit={handleProductSubmit} className="glass-card animate-slide-up" style={{flex:1, marginBottom:'2rem'}}>
            <h3 style={{marginBottom:'1rem', color:'var(--primary)'}}>New Product</h3>
            <div className="form-group"><label>Product Name</label><input required className="input-field" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} /></div>
            <div className="form-group"><label>Buying Price (cost)</label><input type="number" required className="input-field" value={form.buying_price} onChange={e=>setForm({...form, buying_price:e.target.value})} /></div>
            <div className="form-group"><label>Selling Price</label><input type="number" required className="input-field" value={form.selling_price} onChange={e=>setForm({...form, selling_price:e.target.value})} /></div>
            <div className="form-group"><label>Product Image</label><input type="file" className="input-field" onChange={e=>setImageFile(e.target.files[0])} accept="image/*" /></div>
            <button type="submit" className="btn-primary" style={{marginTop:'1rem'}}>{t.save}</button>
          </form>
        )}

        <form onSubmit={handleStockSubmit} className="glass-card animate-slide-up" style={{flex:1, marginBottom:'2rem', background:'var(--card-bg)'}}>
           <h3 style={{marginBottom:'1rem', color:'var(--secondary)'}}>➕ Add Stock Entry</h3>
           <div className="form-group"><label>Select Product</label>
             <select required className="input-field" value={stockForm.product} onChange={e=>setStockForm({...stockForm, product:e.target.value})}>
               <option value="">-- Choose --</option>
               {products.map(p => <option key={p.id} value={p.id}>{p.name} (Current: {p.stock})</option>)}
             </select>
           </div>
           <div className="form-group"><label>Quantity to Add</label><input type="number" required className="input-field" value={stockForm.quantity} onChange={e=>setStockForm({...stockForm, quantity:e.target.value})} /></div>
           <button type="submit" className="btn-secondary" style={{width:'100%'}}>Update Stock</button>
        </form>
      </div>

      <div className="glass-card" style={{overflowX:'auto'}}>
        <div className="table-responsive">
          <table className="data-table">
          <thead>
            <tr>
              <th>Image</th><th>Product Name</th><th>Cost Price</th><th>Selling Price</th><th>Est. Profit/Unit</th><th>Current Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>
                  {p.image ? (
                    <img 
                      src={getImageUrl(p.image)} 
                      alt={p.name} 
                      style={{width:'50px', height:'50px', objectFit:'cover', borderRadius:'8px'}} 
                    />
                  ) : (
                    <div style={{width:'50px', height:'50px', background:'var(--border-color)', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.7rem'}}>No Image</div>
                  )}
                </td>
                <td style={{fontWeight:'bold'}}>{p.name}</td><td>৳{p.buying_price}</td><td>৳{p.selling_price}</td>
                <td style={{color:'var(--success)', fontWeight:'bold'}}>৳{(p.selling_price - p.buying_price).toFixed(2)}</td>
                <td style={{color: p.stock < 5 ? 'var(--danger)' : 'var(--text-main)', fontWeight:'bold'}}>
                  {p.stock} units
                  {p.stock < 5 && <span style={{marginLeft:'8px', fontSize:'0.8rem'}}>⚠️ Low</span>}
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
