import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useTranslation } from '../hooks/useTranslation';
import WorkSettingsModal from '../components/WorkSettingsModal';
import { useNavigate } from 'react-router-dom';

export default function EmployeesPage() {
  const t = useTranslation();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: '', position: '', phone: '', monthly_salary: '', is_moderator: false, email: '', password: '' });

  const load = async () => setEmployees((await api.get('employees/list/')).data);
  useEffect(() => { load() }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('employees/list/', newEmployee);
    setShowAdd(false);
    setNewEmployee({ name: '', position: '', phone: '', monthly_salary: '', is_moderator: false, email: '', password: '' });
    load();
  };

  const deleteEmp = async (id) => {
    if(window.confirm('Delete this employee?')) {
      await api.delete(`employees/list/${id}/`);
      load();
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(search.toLowerCase()) || 
    emp.position.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2rem', flexWrap:'wrap', gap:'1rem'}}>
        <h2 style={{margin:0}}>{t.employees} Management</h2>
        <div style={{display:'flex', gap:'0.75rem'}}>
          <button className="btn-secondary" onClick={() => setShowSettings(true)}>
            ⚙️ Office Settings
          </button>
          <button className="btn-primary" onClick={() => setShowAdd(!showAdd)}>
            {showAdd ? t.cancel : `+ ${t.add_new}`}
          </button>
        </div>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="glass-card animate-slide-up" style={{marginBottom:'2rem'}}>
          <h3>Add New Staff</h3>
          <div className="grid-cards" style={{marginTop:'1rem'}}>
            <div className="form-group"><label>Name</label><input required className="input-field" value={newEmployee.name} onChange={e=>setNewEmployee({...newEmployee, name:e.target.value})} /></div>
            <div className="form-group"><label>Position</label><input required className="input-field" value={newEmployee.position} onChange={e=>setNewEmployee({...newEmployee, position:e.target.value})} /></div>
            <div className="form-group"><label>Phone</label><input className="input-field" value={newEmployee.phone} onChange={e=>setNewEmployee({...newEmployee, phone:e.target.value})} /></div>
            <div className="form-group"><label>Monthly Salary (৳)</label><input type="number" required className="input-field" value={newEmployee.monthly_salary} onChange={e=>setNewEmployee({...newEmployee, monthly_salary:e.target.value})} /></div>
            <div className="form-group" style={{gridColumn: '1 / -1'}}>
              <label style={{display:'flex', alignItems:'center', gap:'0.5rem', cursor:'pointer', fontWeight:'bold', color:'var(--primary)'}}>
                <input type="checkbox" checked={newEmployee.is_moderator} onChange={e=>setNewEmployee({...newEmployee, is_moderator: e.target.checked})} />
                Give Moderator Access (Create Login Credentials)
              </label>
            </div>
            {newEmployee.is_moderator && (
              <>
                <div className="form-group"><label>Login Email (ID)</label><input type="email" required className="input-field" value={newEmployee.email} onChange={e=>setNewEmployee({...newEmployee, email:e.target.value})} /></div>
                <div className="form-group"><label>Login Password</label><input type="text" required className="input-field" value={newEmployee.password} onChange={e=>setNewEmployee({...newEmployee, password:e.target.value})} minLength={6} /></div>
              </>
            )}
          </div>
          <button type="submit" className="btn-primary" style={{marginTop:'1rem'}}>{t.save}</button>
        </form>
      )}

      <div className="glass-card" style={{marginBottom:'2rem', padding:'1rem'}}>
         <input 
           className="input-field" 
           placeholder="🔍 Search employees by name or position..." 
           value={search}
           onChange={e => setSearch(e.target.value)}
           style={{maxWidth:'400px'}}
         />
      </div>

      <div className="glass-card" style={{overflowX:'auto'}}>
        <div className="table-responsive">
          <table className="data-table">
          <thead>
            <tr>
              <th>Name</th><th>Position</th><th>Phone</th><th>Salary</th><th>Joined</th><th>{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map(emp => (
              <tr key={emp.id}>
                <td>
                  <div style={{fontWeight:'bold'}}>{emp.name}</div>
                  {emp.has_account && <span style={{fontSize:'0.7rem', background:'var(--primary)', color:'white', padding:'1px 6px', borderRadius:'10px'}}>Moderator</span>}
                </td><td>{emp.position}</td><td>{emp.phone}</td>
                <td style={{fontWeight:'bold', color:'var(--success)'}}>৳{emp.monthly_salary}</td>
                <td>{new Date(emp.join_date).toLocaleDateString()}</td>
                <td>
                  <div style={{display:'flex', gap:'0.5rem'}}>
                    <button onClick={() => navigate(`/attendance-report?employee=${emp.id}`)} className="btn-secondary" style={{padding:'4px 8px', fontSize:'0.85rem'}}>📅 Attendance</button>
                    <button onClick={()=>deleteEmp(emp.id)} className="btn-secondary" style={{borderColor:'var(--danger)', color:'var(--danger)', padding:'4px 8px', fontSize:'0.85rem'}}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredEmployees.length === 0 && <tr><td colSpan="6" style={{textAlign:'center', padding:'2rem', color:'var(--text-muted)'}}>No employees found.</td></tr>}
          </tbody>
        </table>
        </div>
      </div>

      {showSettings && <WorkSettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
