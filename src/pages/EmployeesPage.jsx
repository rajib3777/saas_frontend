import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useTranslation } from '../hooks/useTranslation';

export default function EmployeesPage() {
  const t = useTranslation();
  const [employees, setEmployees] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
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

  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'2rem'}}>
        <h2>{t.employees} Management</h2>
        <button className="btn-primary" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? t.cancel : `+ ${t.add_new}`}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="glass-card animate-slide-up" style={{marginBottom:'2rem'}}>
          <div className="grid-cards">
            <div className="form-group"><label>Name</label><input required className="input-field" value={newEmployee.name} onChange={e=>setNewEmployee({...newEmployee, name:e.target.value})} /></div>
            <div className="form-group"><label>Position</label><input required className="input-field" value={newEmployee.position} onChange={e=>setNewEmployee({...newEmployee, position:e.target.value})} /></div>
            <div className="form-group"><label>Phone</label><input className="input-field" value={newEmployee.phone} onChange={e=>setNewEmployee({...newEmployee, phone:e.target.value})} /></div>
            <div className="form-group"><label>Monthly Salary (৳)</label><input type="number" required className="input-field" value={newEmployee.monthly_salary} onChange={e=>setNewEmployee({...newEmployee, monthly_salary:e.target.value})} /></div>
            <div className="form-group" style={{gridColumn: '1 / -1'}}>
              <label style={{display:'flex', alignItems:'center', gap:'0.5rem', cursor:'pointer', fontWeight:'bold'}}>
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

      <div className="glass-card" style={{overflowX:'auto'}}>
        <div className="table-responsive">
          <table className="data-table">
          <thead>
            <tr>
              <th>Name</th><th>Position</th><th>Phone</th><th>Salary</th><th>Joined</th><th>{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp.id}>
                <td>
                  {emp.name}
                  {emp.has_account && <span style={{marginLeft:'8px', fontSize:'0.75rem', background:'var(--primary)', color:'white', padding:'2px 6px', borderRadius:'12px'}}>Moderator</span>}
                </td><td>{emp.position}</td><td>{emp.phone}</td>
                <td style={{fontWeight:'bold', color:'var(--success)'}}>৳{emp.monthly_salary}</td>
                <td>{new Date(emp.join_date).toLocaleDateString()}</td>
                <td>
                  <button onClick={()=>deleteEmp(emp.id)} className="btn-secondary" style={{borderColor:'var(--danger)', color:'var(--danger)', padding:'4px 8px'}}>Delete</button>
                </td>
              </tr>
            ))}
            {employees.length === 0 && <tr><td colSpan="6" style={{textAlign:'center', padding:'2rem', color:'var(--text-muted)'}}>No employees found.</td></tr>}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
