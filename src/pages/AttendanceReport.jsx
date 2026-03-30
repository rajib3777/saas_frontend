import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../context/LanguageContext';

export default function AttendanceReport() {
  const t = useTranslation();
  const { lang } = useLanguage();
  const [searchParams] = useSearchParams();
  const employeeId = searchParams.get('employee');
  
  const [report, setReport] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (employeeId) loadReport();
  }, [employeeId, month, year]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const res = await api.get('employees/attendance/summary/', { params: { employee: employeeId, month, year } });
      setReport(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!employeeId) return <div>{t.no_employee_selected}</div>;
  if (loading && !report) return <div>{t.loading_report}</div>;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--primary)' }}>📅 {t.attendance_report_title}</h2>
          <h3 style={{ margin: 0, color: 'var(--text-muted)' }}>{report?.employee_name}</h3>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <select className="input-field" value={month} onChange={e => setMonth(e.target.value)}>
             {Array.from({length: 12}, (_, i) => (
                <option key={i+1} value={i+1}>{new Date(2000, i).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US', { month: 'long' })}</option>
             ))}
          </select>
          <input type="number" className="input-field" style={{ width: '100px' }} value={year} onChange={e => setYear(e.target.value)} />
          <button className="btn-secondary" onClick={() => window.print()}>🖨️ {lang === 'bn' ? 'প্রিন্ট' : 'Print'}</button>
        </div>
      </div>

      {report && (
        <>
          <div className="grid-cards" style={{ marginBottom: '2rem' }}>
            <div className="glass-card" style={{ borderLeft: '4px solid var(--success)', padding: '1.2rem' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>{t.ontime_label}</div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--success)' }}>{report.stats.ontime}</div>
            </div>
            <div className="glass-card" style={{ borderLeft: '4px solid var(--danger)', padding: '1.2rem' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>{t.late}</div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--danger)' }}>{report.stats.late}</div>
            </div>
            <div className="glass-card" style={{ borderLeft: '4px solid #94A3B8', padding: '1.2rem' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>{t.missed_label}</div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#64748B' }}>{report.stats.miss}</div>
            </div>
          </div>

          <div className="glass-card" style={{ overflowX: 'auto', padding: '1rem' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t.date}</th>
                  <th>{t.status}</th>
                  <th>{t.entry_time}</th>
                  <th>{t.exit_time}</th>
                  <th>{t.work_hours}</th>
                </tr>
              </thead>
              <tbody>
                {report.days.map(day => (
                  <tr key={day.date} style={{ opacity: day.status === 'none' ? 0.4 : 1 }}>
                    <td>{new Date(day.date).toLocaleDateString('default', { day: 'numeric', weekday: 'short' })}</td>
                    <td>
                      <StatusBadge status={day.status} />
                    </td>
                    <td>{day.entry ? day.entry.substring(0, 5) : '—'}</td>
                    <td>{day.exit ? day.exit.substring(0, 5) : '—'}</td>
                    <td style={{ fontWeight: 'bold' }}>{day.hours > 0 ? `${day.hours}${t.hours_abbr}` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    ontime: { background: 'rgba(34,197,94,0.15)', color: '#22C55E' },
    late: { background: 'rgba(239,68,68,0.15)', color: '#EF4444' },
    miss: { background: 'rgba(100,116,139,0.15)', color: '#64748B' },
    'off-day': { background: 'rgba(124,58,237,0.15)', color: '#7C3AED' },
    none: { background: 'transparent', color: 'var(--text-muted)' }
  };
  const s = styles[status] || styles.none;
  return (
    <span style={{ 
      padding: '4px 10px', 
      borderRadius: '12px', 
      fontSize: '0.75rem', 
      fontWeight: 'bold', 
      background: s.background, 
      color: s.color,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px'
    }}>
      {status === 'ontime' && '● '}
      {status === 'late' && '● '}
      {status.toUpperCase()}
    </span>
  );
}
