import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export default function InventoryPage() {
  const t = useTranslation();
  const { lang } = useLanguage();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', buying_price: '', selling_price: '' });
  const [imageFile, setImageFile] = useState(null);
  const [stockForm, setStockForm] = useState({ product: '', quantity: '' });

  const load = async () => setProducts((await api.get('shop/products/')).data);
  useEffect(() => { load() }, []);

  const handleEdit = (p) => {
    setEditingId(p.id);
    setForm({ name: p.name, buying_price: p.buying_price, selling_price: p.selling_price });
    setShowAdd(true);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name: '', buying_price: '', selling_price: '' });
    setShowAdd(false);
    setImageFile(null);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('buying_price', form.buying_price);
    formData.append('selling_price', form.selling_price);
    if (imageFile) {
      formData.append('image', imageFile);
    }
    
    try {
        if (editingId) {
            await api.patch(`shop/products/${editingId}/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert(t.product_updated_success);
        } else {
            await api.post('shop/products/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert(t.product_added_success);
        }
        
        cancelEdit();
        load();
    } catch (err) {
        alert(t.save_error);
    }
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    // Ensure quantity is sent as a Number to avoid potential 500 errors in the backend
    const payload = {
        ...stockForm,
        quantity: Number(stockForm.quantity)
    };
    try {
        await api.post('shop/stock/', payload);
        setStockForm({ product: '', quantity: '' });
        alert(t.stock_updated_success);
        load();
    } catch (err) {
        alert(t.save_error);
    }
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
              <th style={{padding:'8px', textAlign:'left'}}>{t.product_name}</th>
              <th style={{padding:'8px', textAlign:'right'}}>{t.unit_cost}</th>
              <th style={{padding:'8px', textAlign:'right'}}>{t.selling_price_label}</th>
              <th style={{padding:'8px', textAlign:'right'}}>{t.stock_qty}</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} style={{borderBottom: '1px solid #ccc'}}>
                <td style={{padding:'8px'}}>{p.name}</td>
                <td style={{padding:'8px', textAlign:'right'}}>৳{p.buying_price}</td>
                <td style={{padding:'8px', textAlign:'right'}}>৳{p.selling_price}</td>
                <td style={{padding:'8px', textAlign:'right', fontWeight:'bold'}}>{p.stock} {t.units}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="no-print" style={{display:'flex', justifyContent:'space-between', marginBottom:'2rem'}}>
        <h2>{t.inventory} {t.management}</h2>
        <div style={{display:'flex', gap:'1rem'}}>
          <button className="btn-secondary" onClick={() => window.print()}>🖨️ {t.print_report}</button>
          <button className="btn-primary" onClick={() => { if(showAdd && editingId) cancelEdit(); else setShowAdd(!showAdd); }}>
            {showAdd ? t.cancel : `+ ${t.add_product}`}
          </button>
        </div>
      </div>

      <div style={{display:'flex', gap:'2rem', alignItems:'flex-start'}}>
        {showAdd && (
          <form onSubmit={handleProductSubmit} className="glass-card animate-slide-up" style={{flex:1, marginBottom:'2rem', border:'1px solid var(--primary)'}}>
            <h3 style={{marginBottom:'1rem', color:'var(--primary)'}}>{editingId ? t.edit_product_title : t.new_product_title}</h3>
            <div className="form-group"><label>{t.product_name}</label><input required className="input-field" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} /></div>
            <div className="form-group"><label>{t.buying_price_cost}</label><input type="number" required className="input-field" value={form.buying_price} onChange={e=>setForm({...form, buying_price:e.target.value})} /></div>
            <div className="form-group"><label>{t.selling_price_label}</label><input type="number" required className="input-field" value={form.selling_price} onChange={e=>setForm({...form, selling_price:e.target.value})} /></div>
            <div className="form-group">
                <label>{t.product_image} {editingId && t.leave_blank_keep}</label>
                <input type="file" className="input-field" onChange={e=>setImageFile(e.target.files[0])} accept="image/*" />
            </div>
            <div style={{display:'flex', gap:'1rem', marginTop:'1rem'}}>
                <button type="submit" className="btn-primary" style={{flex:1}}>{editingId ? t.status === 'bn' ? 'আপডেট' : 'Update' : t.save}</button>
                {editingId && <button type="button" className="btn-secondary" onClick={cancelEdit} style={{flex:1}}>{t.cancel}</button>}
            </div>
          </form>
        )}

        <form onSubmit={handleStockSubmit} className="glass-card animate-slide-up" style={{flex:1, marginBottom:'2rem', background:'var(--card-bg)'}}>
           <h3 style={{marginBottom:'1rem', color:'var(--secondary)'}}>{t.add_stock_entry}</h3>
           <div className="form-group"><label>{t.select_product_label}</label>
              <select required className="input-field" value={stockForm.product} onChange={e=>setStockForm({...stockForm, product:e.target.value})}>
                <option value="">{t.choose_option}</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} ({lang === 'bn' ? 'বর্তমান' : 'Current'}: {p.stock})</option>)}
              </select>
           </div>
           <div className="form-group"><label>{t.qty_to_add}</label><input type="number" required className="input-field" value={stockForm.quantity} onChange={e=>setStockForm({...stockForm, quantity:e.target.value})} /></div>
           <button type="submit" className="btn-secondary" style={{width:'100%'}}>{t.update_stock_btn}</button>
        </form>
      </div>

      <div className="glass-card" style={{overflowX:'auto'}}>
        <div className="table-responsive">
          <table className="data-table">
          <thead>
            <tr>
              <th>{lang === 'bn' ? 'ছবি' : 'Image'}</th><th>{t.product_name}</th><th>{t.unit_cost}</th><th>{t.selling_price_label}</th><th>{t.est_profit_unit}</th><th>{t.stock_qty}</th><th>{t.actions}</th>
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
                  {p.stock} {t.units}
                  {p.stock < 5 && <span style={{marginLeft:'8px', fontSize:'0.8rem'}}>{t.low_stock_tag}</span>}
                </td>
                <td>
                    <button onClick={()=>handleEdit(p)} className="btn-secondary" style={{padding:'4px 8px', fontSize:'0.8rem'}}>{lang === 'bn' ? 'এডিট' : 'Edit'}</button>
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
