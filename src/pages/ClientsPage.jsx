import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useTranslation } from '../hooks/useTranslation';

export default function ClientsPage() {
  const t = useTranslation();
  const [clients, setClients] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', service: '', total_amount: '' });

  const load = async () => setClients((await api.get('office/clients/')).data);
  useEffect(() => { load() }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('office/clients/', form);
    setShowAdd(false);
    setForm({ name: '', email: '', phone: '', service: '', total_amount: '' });
    load();
  };

  const deleteItem = async (id) => {
    if(window.confirm('Delete this client?')) {
      await api.delete(`office/clients/${id}/`);
      load();
    }
  };

  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'2rem'}}>
        <h2>{t.clients} Management</h2>
        <button className="btn-primary" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? t.cancel : `+ ${t.add_new}`}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="glass-card animate-slide-up" style={{marginBottom:'2rem'}}>
          <div className="grid-cards">
            <div className="form-group"><label>Client Name</label><input required className="input-field" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} /></div>
            <div className="form-group"><label>Service Provided</label><input required className="input-field" value={form.service} onChange={e=>setForm({...form, service:e.target.value})} /></div>
            <div className="form-group"><label>Contract Amount (৳)</label><input type="number" required className="input-field" value={form.total_amount} onChange={e=>setForm({...form, total_amount:e.target.value})} /></div>
          </div>
          <button type="submit" className="btn-primary" style={{marginTop:'1rem'}}>{t.save}</button>
        </form>
      )}

      <div className="glass-card" style={{overflowX:'auto'}}>
        <div className="table-responsive">
          <table className="data-table">
          <thead>
            <tr>
              <th>Client Name</th><th>Service</th><th>Total Bill</th><th>Paid</th><th>Due</th><th>{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {clients.map(c => (
              <tr key={c.id}>
                <td style={{fontWeight:'bold'}}>{c.name}</td><td>{c.service}</td>
                <td>৳{c.total_amount}</td><td style={{color:'var(--success)'}}>৳{c.paid_amount}</td>
                <td style={{color:'var(--danger)', fontWeight:'bold'}}>৳{c.due_amount}</td>
                <td>
                  <button onClick={()=>deleteItem(c.id)} className="btn-secondary" style={{borderColor:'var(--danger)', color:'var(--danger)', padding:'4px 8px'}}>Delete</button>
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
