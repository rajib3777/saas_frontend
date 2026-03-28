import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../context/AuthContext';

export default function ClientsPage() {
  const t = useTranslation();
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', service: '', total_amount: '' });
  const [selectedClient, setSelectedClient] = useState(null);

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

  const handleMarkAsPaid = async (id) => {
    if(window.confirm('Mark this client as fully paid? This will create a payment record for the remaining balance.')) {
        try {
            await api.post(`office/clients/${id}/mark-as-paid/`);
            alert('Balance settled successfully! ✅');
            load();
        } catch (err) {
            alert('Error settling balance.');
        }
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
            <div className="form-group"><label>Client Phone</label><input className="input-field" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} /></div>
            <div className="form-group"><label>Client Email</label><input type="email" className="input-field" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} /></div>
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
              <th>Client Details</th><th>Service</th><th>Total Bill</th><th>Paid</th><th>Due</th><th>{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {clients.map(c => (
              <tr key={c.id}>
                <td>
                    <div style={{fontWeight:'bold'}}>{c.name}</div>
                    <div style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>{c.phone}</div>
                </td>
                <td>{c.service}</td>
                <td>৳{c.total_amount}</td>
                <td style={{color:'var(--success)'}}>৳{c.paid_amount}</td>
                <td style={{color: parseFloat(c.due_amount) > 0 ? 'var(--danger)' : 'var(--success)', fontWeight:'bold'}}>
                    ৳{c.due_amount}
                </td>
                <td>
                  <div style={{display:'flex', gap:'0.5rem'}}>
                    {parseFloat(c.due_amount) > 0 && (
                        <button onClick={()=>handleMarkAsPaid(c.id)} className="btn-primary" style={{padding:'4px 8px', fontSize:'0.75rem', backgroundColor:'var(--success)'}}>✅ Paid</button>
                    )}
                    <button onClick={()=>setSelectedClient(c)} className="btn-secondary" style={{padding:'4px 8px', fontSize:'0.75rem'}}>📜 Invoice</button>
                    <button onClick={()=>deleteItem(c.id)} className="btn-secondary" style={{borderColor:'var(--danger)', color:'var(--danger)', padding:'4px 8px', fontSize:'0.75rem'}}>Del</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* Invoice Modal */}
      {selectedClient && (
        <div className="modal-overlay" style={{
            position:'fixed', top:0, left:0, width:'100%', height:'100%', 
            backgroundColor:'rgba(0,0,0,0.7)', zIndex:1000, display:'flex', 
            alignItems:'center', justifyContent:'center', padding:'1rem'
        }}>
            <div className="glass-card" id="printable-invoice" style={{
                backgroundColor:'white', color:'black', width:'100%', maxWidth:'800px', 
                maxHeight:'90vh', overflowY:'auto', padding:'2.5rem', borderRadius:'8px'
            }}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'2rem', borderBottom:'2px solid #eee', paddingBottom:'1rem'}}>
                    <div>
                        <h1 style={{color:'var(--primary)', margin:0}}>{user?.business_name || 'Hishebghor'}</h1>
                        <p style={{margin:0, color:'#666'}}>Professional Service Invoice</p>
                    </div>
                    <div style={{textAlign:'right'}}>
                        <h3 style={{margin:0}}>INVOICE</h3>
                        <p style={{margin:0, color:'#666'}}>Date: {new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="grid-cards" style={{gridTemplateColumns:'1fr 1fr', marginBottom:'2rem'}}>
                    <div>
                        <h4 style={{marginBottom:'0.5rem', color:'#888'}}>BILL TO:</h4>
                        <div style={{fontWeight:'bold', fontSize:'1.1rem'}}>{selectedClient.name}</div>
                        <div>{selectedClient.phone}</div>
                        <div>{selectedClient.email}</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                        <h4 style={{marginBottom:'0.5rem', color:'#888'}}>SERVICE:</h4>
                        <div style={{fontWeight:'bold'}}>{selectedClient.service}</div>
                    </div>
                </div>

                <h4 style={{marginBottom:'1rem', borderBottom:'1px solid #eee', paddingBottom:'0.5rem'}}>PAYMENT HISTORY</h4>
                <table style={{width:'100%', borderCollapse:'collapse', marginBottom:'2rem'}}>
                    <thead>
                        <tr style={{backgroundColor:'#f8f9fa', textAlign:'left'}}>
                            <th style={{padding:'10px', borderBottom:'1px solid #eee'}}>Date</th>
                            <th style={{padding:'10px', borderBottom:'1px solid #eee'}}>Note</th>
                            <th style={{padding:'10px', borderBottom:'1px solid #eee', textAlign:'right'}}>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedClient.payments && selectedClient.payments.length > 0 ? (
                            selectedClient.payments.map((p, idx) => (
                                <tr key={idx}>
                                    <td style={{padding:'10px', borderBottom:'1px solid #eee'}}>{new Date(p.date).toLocaleDateString()}</td>
                                    <td style={{padding:'10px', borderBottom:'1px solid #eee'}}>{p.note || 'Regular Payment'}</td>
                                    <td style={{padding:'10px', borderBottom:'1px solid #eee', textAlign:'right'}}>৳{p.amount}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="3" style={{padding:'1rem', textAlign:'center', color:'#999'}}>No payments recorded yet.</td></tr>
                        )}
                    </tbody>
                </table>

                <div style={{display:'flex', justifyContent:'flex-end'}}>
                    <div style={{width:'300px'}}>
                        <div style={{display:'flex', justifyContent:'space-between', padding:'5px 0'}}>
                            <span>Total Bill:</span><span style={{fontWeight:'bold'}}>৳{selectedClient.total_amount}</span>
                        </div>
                        <div style={{display:'flex', justifyContent:'space-between', padding:'5px 0', color:'green'}}>
                            <span>Total Paid:</span><span style={{fontWeight:'bold'}}>৳{selectedClient.paid_amount}</span>
                        </div>
                        <div style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderTop:'2px solid #eee', marginTop:'5px', fontSize:'1.2rem', color:'red'}}>
                            <span style={{fontWeight:'bold'}}>Outstanding Due:</span><span style={{fontWeight:'bold'}}>৳{selectedClient.due_amount}</span>
                        </div>
                    </div>
                </div>

                <div className="no-print" style={{marginTop:'3rem', display:'flex', gap:'1rem', justifyContent:'flex-end'}}>
                    <button className="btn-secondary" onClick={() => setSelectedClient(null)}>Close</button>
                    <button className="btn-primary" onClick={() => window.print()}>Print Invoice</button>
                </div>
            </div>
            <style>
                {`
                    @media print {
                        body * { visibility: hidden; }
                        #printable-invoice, #printable-invoice * { visibility: visible; }
                        #printable-invoice { position: absolute; left: 0; top: 0; width: 100%; margin:0; padding:0; box-shadow:none; }
                        .no-print { display: none !important; }
                    }
                `}
            </style>
        </div>
      )}
    </div>
  );
}
