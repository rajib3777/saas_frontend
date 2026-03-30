import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../context/LanguageContext';

export default function WorkSettingsModal({ onClose }) {
  const t = useTranslation();
  const { lang } = useLanguage();
  const [settings, setSettings] = useState({ entry_cutoff_time: '09:00', off_days: [] });
  const [newOffDay, setNewOffDay] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await api.get('employees/settings/');
      setSettings(res.data);
    } catch (err) {
      console.error("Failed to load settings", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.put(`employees/settings/${settings.id}/`, settings);
      alert(t.settings_updated);
      onClose();
    } catch (err) {
      alert(t.settings_error);
    }
  };

  const addOffDay = () => {
    if (!newOffDay) return;
    if (settings.off_days.includes(newOffDay)) return alert(t.date_already_added);
    setSettings({ ...settings, off_days: [...settings.off_days, newOffDay].sort() });
    setNewOffDay('');
  };

  const removeOffDay = (date) => {
    setSettings({ ...settings, off_days: settings.off_days.filter(d => d !== date) });
  };

  if (loading) return null;

  return (
    <div className="modal-overlay">
      <div className="glass-card animate-zoom-in" style={{ width: '500px', maxWidth: '95%', padding: '2rem', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>&times;</button>
        
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>⚙️ {t.office_work_settings}</h2>
        
        <form onSubmit={handleSave}>
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>{t.entry_cutoff_label}</label>
            <input 
              type="time" 
              className="input-field" 
              value={settings.entry_cutoff_time.substring(0, 5)} 
              onChange={e => setSettings({ ...settings, entry_cutoff_time: e.target.value })} 
              required
            />
            <small style={{ color: 'var(--text-muted)' }}>{t.cutoff_hint}</small>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontWeight: 'bold' }}>{t.manage_off_days}</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <input 
                type="date" 
                className="input-field" 
                value={newOffDay} 
                onChange={e => setNewOffDay(e.target.value)} 
              />
              <button type="button" onClick={addOffDay} className="btn-secondary" style={{ whiteSpace: 'nowrap' }}>+ {t.add_date_btn}</button>
            </div>
          </div>

          <div className="glass-card" style={{ maxHeight: '150px', overflowY: 'auto', background: 'rgba(255,255,255,0.05)', marginBottom: '2rem', padding: '0.5rem' }}>
            {settings.off_days.length === 0 && <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>{t.no_off_days}</div>}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {settings.off_days.map(date => (
                <span key={date} style={{ 
                  background: 'var(--primary)', 
                  color: 'white', 
                  padding: '4px 8px', 
                  borderRadius: '12px', 
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {new Date(date).toLocaleDateString()}
                  <button type="button" onClick={() => removeOffDay(date)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1rem', padding: 0 }}>&times;</button>
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn-primary" style={{ flex: 1 }}>{t.save_settings_btn}</button>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>{t.cancel}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
