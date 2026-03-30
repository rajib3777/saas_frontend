import { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function LoginPage() {
  const t = useTranslation();
  const { toggleLang, lang } = useLanguage();
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isLogin, setIsLogin] = useState(!location.state?.isSignup);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [subscriptionType, setSubscriptionType] = useState(location.state?.plan || 'office');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await login(email, password);
        navigate('/dashboard');
      } else {
        await register({
          email,
          password,
          full_name: fullName,
          phone,
          business_name: businessName,
          subscription_type: subscriptionType
        });
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || t.auth_failed);
    }
  };

  return (
    <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg-color)'}}>
      <div className="glass-card animate-slide-up" style={{maxWidth:'450px', width:'100%', position:'relative'}}>
        <Link to="/" style={{display:'inline-block', marginBottom:'1.5rem', color:'var(--text-muted)', textDecoration:'none', fontSize:'0.9rem'}}>← {t.back_home}</Link>
        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'2rem'}}>
          <h2 style={{color:'var(--primary)'}}>{isLogin ? t.login : t.signup}</h2>
          <button className="btn-secondary" onClick={toggleLang} style={{padding:'4px 8px'}}>{lang === 'en' ? 'বাংলা' : 'English'}</button>
        </div>
        
        {error && <div style={{color:'var(--danger)', marginBottom:'1rem'}}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="form-group">
                <label>{t.full_name}</label>
                <input type="text" required className="input-field" value={fullName} onChange={e=>setFullName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>{t.phone}</label>
                <input type="tel" required className="input-field" value={phone} onChange={e=>setPhone(e.target.value)} />
              </div>
              <div className="form-group">
                <label>{t.business_name}</label>
                <input type="text" className="input-field" value={businessName} onChange={e=>setBusinessName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>{t.subscription_type}</label>
                <select className="input-field" value={subscriptionType} onChange={e=>setSubscriptionType(e.target.value)} style={{background: 'var(--bg-color)', color: 'var(--text-main)'}}>
                  <option value="office">{t.office_plan}</option>
                  <option value="shop">{t.shop_plan}</option>
                </select>
              </div>
            </>
          )}
          <div className="form-group">
            <label>{t.email}</label>
            <input type="email" required className="input-field" value={email} onChange={e=>setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label>{t.password}</label>
            <input type="password" required className="input-field" value={password} onChange={e=>setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary" style={{width:'100%'}}>{isLogin ? t.login : t.submit}</button>
        </form>
        
        <p style={{marginTop:'1.5rem', textAlign:'center'}}>
          <button onClick={() => setIsLogin(!isLogin)} style={{background:'none', border:'none', color:'var(--secondary)', cursor:'pointer', fontSize:'0.9rem'}}>
            {isLogin ? t.need_account : t.already_account}
          </button>
        </p>
      </div>
    </div>
  );
}
