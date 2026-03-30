import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement, Filler
} from 'chart.js';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { 
  UsersIcon, 
  CurrencyDollarIcon, 
  BuildingLibraryIcon, 
  BuildingOfficeIcon, 
  ChartBarIcon, 
  ArrowTrendingDownIcon, 
  ArrowTrendingUpIcon, 
  GiftIcon, 
  TrophyIcon, 
  ScaleIcon, 
  MegaphoneIcon, 
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement, Filler);

const StatCard = ({ title, value, color, icon }) => (
  <div className="glass-card stat-card animate-slide-up" style={{
    position: 'relative', overflow: 'hidden', padding: '1.25rem',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
    borderLeft: `5px solid ${color}`, borderTop: 'none'
  }}>
    <div style={{ zIndex: 1, flex: 1, minWidth: 0 }}>
      <h4 style={{color:'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom:'0.5rem', lineHeight: '1.3', wordWrap: 'break-word'}}>{title}</h4>
      <h2 style={{fontSize:'1.6rem', fontWeight: '700', color:'var(--text-main)', margin: 0, wordWrap: 'break-word'}}>{value}</h2>
    </div>
    {icon && (
      <div style={{
        backgroundColor: `${color}20`, color: color, width: '45px', height: '45px',
        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1, flexShrink: 0
      }}>
        <div style={{ width: '24px', height: '24px' }}>
          {icon}
        </div>
      </div>
    )}
    <div style={{
      position: 'absolute', right: '-10%', top: '-20%',
      width: '120px', height: '120px', background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`, zIndex: 0
    }} />
  </div>
);

export default function DashboardOverview() {
  const { user } = useAuth();
  const t = useTranslation();
  const [data, setData] = useState(null);

  const fetchDashboard = async () => {
    if (user?.role === 'moderator') return setData({ moderator: true });
    try {
      const res = await api.get('dashboard/');
      setData(res.data);
    } catch(err) {}
  };

  useEffect(() => {
    fetchDashboard();
  }, [user]);



  const [checkIn, setCheckIn] = useState({ location: '', message: '' });
  const [todayRecord, setTodayRecord] = useState(null);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  const fetchTodayRecord = async () => {
    if (user?.role !== 'moderator') return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await api.get('employees/attendance/', { params: { date: today } });
      if (res.data.length > 0) setTodayRecord(res.data[0]);
    } catch (err) {}
  };

  useEffect(() => {
    fetchDashboard();
    fetchTodayRecord();
  }, [user]);

  const handleCheckIn = async (e) => {
    e.preventDefault();
    setLoadingAttendance(true);
    try {
      const d = new Date();
      await api.post('employees/attendance/', {
         employee: user.employee_id,
         date: d.toISOString().split('T')[0],
         entry_time: d.toTimeString().split(' ')[0],
         location: checkIn.location,
         message: checkIn.message
      });
      alert(t.checked_in);
      setCheckIn({location: '', message: ''});
      fetchTodayRecord();
    } catch(err) {
      alert(t.auth_failed);
    } finally {
      setLoadingAttendance(false);
    }
  };

  const handleCheckOut = async () => {
    setLoadingAttendance(true);
    try {
      await api.post('employees/attendance/checkout/');
      alert(t.checked_out);
      fetchTodayRecord();
    } catch(err) {
      alert(t.auth_failed);
    } finally {
      setLoadingAttendance(false);
    }
  };

  if (!data) return <div style={{padding:'2rem', textAlign:'center'}}>{t.loading_dash}</div>;

  if (user?.role === 'moderator') {
    return (
      <div className="animate-fade-in">
        <h2 style={{color:'var(--primary)', marginBottom:'1.5rem'}}>{t.moderator_dash}</h2>
        
        <div className="grid-cards" style={{marginBottom:'2rem'}}>
          <div className="glass-card" style={{padding:'2rem'}}>
            <h3 style={{marginBottom:'1rem'}}>{t.daily_attendance}</h3>
            
            {!todayRecord ? (
              <>
                <p style={{color:'var(--text-muted)'}}>{t.log_attendance_desc}</p>
                <form onSubmit={handleCheckIn} style={{marginTop:'1.5rem', maxWidth:'500px'}}>
                   <div className="form-group"><label>{t.curr_location}</label><input required className="input-field" value={checkIn.location} onChange={e=>setCheckIn({...checkIn, location: e.target.value})} placeholder={t.loc_placeholder} /></div>
                   <div className="form-group"><label>{t.msg_note}</label><textarea required className="input-field" rows="3" value={checkIn.message} onChange={e=>setCheckIn({...checkIn, message: e.target.value})} placeholder={t.msg_placeholder} /></div>
                   <button type="submit" disabled={loadingAttendance} className="btn-primary" style={{marginTop:'1rem', width:'100%'}}>
                     {loadingAttendance ? t.submitting : t.submit_checkin}
                   </button>
                </form>
              </>
            ) : (
              <div style={{marginTop:'1.5rem'}}>
                <div className="glass-card" style={{background:'rgba(34,197,94,0.1)', borderLeft:'4px solid #22C55E', padding:'1rem', marginBottom:'1.5rem'}}>
                  <h4 style={{color:'#166534', margin:0}}>✓ {t.checked_in}</h4>
                  <p style={{margin:'5px 0 0 0', fontSize:'0.9rem'}}>{t.time}: <strong>{todayRecord.entry_time.substring(0, 5)}</strong> | {t.status_label}: <strong style={{color: todayRecord.is_late ? 'var(--danger)' : 'var(--success)'}}>{todayRecord.is_late ? t.late : t.ontime}</strong></p>
                </div>
                
                {!todayRecord.exit_time ? (
                  <div style={{textAlign:'center'}}>
                    <p style={{color:'var(--text-muted)', marginBottom:'1rem'}}>{t.checkout_remind}</p>
                    <button onClick={handleCheckOut} disabled={loadingAttendance} className="btn-secondary" style={{width:'100%', maxWidth:'300px', borderColor:'var(--primary)', color:'var(--primary)'}}>
                      {loadingAttendance ? t.processing : `📤 ${t.click_checkout}`}
                    </button>
                  </div>
                ) : (
                  <div className="glass-card" style={{background:'rgba(99,102,241,0.1)', borderLeft:'4px solid #6366F1', padding:'1rem'}}>
                    <h4 style={{color:'#3730A3', margin:0}}>✓ {t.checked_out}</h4>
                    <p style={{margin:'5px 0 0 0', fontSize:'0.9rem'}}>{t.time}: <strong>{todayRecord.exit_time.substring(0, 5)}</strong> | {t.duration}: <strong>{todayRecord.working_hours} {t.hours}</strong></p>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="glass-card" style={{padding:'2rem', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', textAlign:'center'}}>
             <div style={{fontSize:'3rem', marginBottom:'1rem'}}>🚀</div>
             <h3>{t.ready_work}</h3>
             <p style={{color:'var(--text-muted)'}}>{t.perf_shared}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{color:'var(--primary)', marginBottom:'2rem'}}>{t.welcome_back}, {user?.business_name}!</h2>

      {/* Common Employee Stats */}
      <h3 style={{marginBottom:'1rem', color:'var(--text-muted)'}}>{t.overview}</h3>
      <div className="grid-cards">
        <StatCard title={t.total_employees} value={data.employees?.total} color="var(--primary)" icon={<UsersIcon />} />
        <StatCard title={t.monthly_salary_exp} value={`৳${data.employees?.total_monthly_salary}`} color="var(--secondary)" icon={<CurrencyDollarIcon />} />
        <StatCard title={t.yearly_salary_exp} value={`৳${data.employees?.total_yearly_salary}`} color="#6366F1" icon={<BuildingLibraryIcon />} />
      </div>

      {/* Office Stats */}
      {user?.subscription_type === 'office' && data.office && (
        <>
          <h3 style={{marginBottom:'1rem', color:'var(--text-muted)'}}>{t.office_summary}</h3>
          <div className="grid-cards">
            <StatCard title={t.active_clients} value={data.office.total_clients} color="#10B981" icon={<BuildingOfficeIcon />} />
            <StatCard title={t.total_income} value={`৳${data.office.total_income}`} color="var(--primary)" icon={<CurrencyDollarIcon />} />
            <StatCard title={t.total_due} value={`৳${data.office.total_due}`} color="var(--danger)" icon={<ArrowTrendingDownIcon />} />
          </div>

          <div className="glass-card" style={{marginTop:'2rem', height:'450px', padding:'1.5rem'}}>
             <h3 style={{marginBottom:'1rem'}}>{t.earnings_trend}</h3>
             <Line 
               data={{
                 labels: data.office.chart.labels,
                 datasets: [
                   {
                     label: t.monthly_income_tk,
                     data: data.office.chart.income,
                     borderColor: '#7C3AED',
                     backgroundColor: 'rgba(124, 58, 237, 0.1)',
                     fill: true,
                     tension: 0.4,
                   }
                 ]
               }} 
               options={{responsive:true, maintainAspectRatio:false}} 
             />
          </div>
        </>
      )}

      {/* Shop Stats */}
      {user?.subscription_type === 'shop' && data.shop && (
        <>
          <h3 style={{marginBottom:'1rem', color:'var(--text-muted)'}}>{t.shop_summary}</h3>
          <div className="grid-cards">
            {/* Running Month */}
            <StatCard title={t.this_month_revenue} value={`৳${data.shop.monthly_revenue}`} color="var(--secondary)" icon={<ChartBarIcon />} />
            <StatCard title={`${t.this_month} ${data.shop.monthly_profit >= 0 ? t.profit : t.loss}`} value={`৳${Math.abs(data.shop.monthly_profit)}`} color={data.shop.monthly_profit >= 0 ? 'var(--success)' : 'var(--danger)'} icon={data.shop.monthly_profit >= 0 ? <ArrowTrendingUpIcon /> : <ArrowTrendingDownIcon />} />
            
            {/* All Time */}
            <StatCard title={t.all_time_revenue} value={`৳${data.shop.all_time_revenue}`} color="#6366F1" icon={<GiftIcon />} />
            <StatCard title={`${t.all_time} ${data.shop.all_time_profit >= 0 ? t.profit : t.loss}`} value={`৳${Math.abs(data.shop.all_time_profit)}`} color={data.shop.all_time_profit >= 0 ? 'var(--success)' : 'var(--danger)'} icon={data.shop.all_time_profit >= 0 ? <TrophyIcon /> : <ScaleIcon />} />
            
            <StatCard title={`${t.ad_profit_roi} (${data.shop.total_ad_revenue >= data.shop.total_ad_spend ? t.profit : t.loss})`} value={`${data.shop.total_ad_spend > 0 ? (((data.shop.total_ad_revenue - data.shop.total_ad_spend)/data.shop.total_ad_spend)*100).toFixed(0) : 0}%`} color="#F472B6" icon={<MegaphoneIcon />} />
            <StatCard title={t.low_stock} value={data.shop.low_stock_products} color="var(--danger)" icon={<ExclamationTriangleIcon />} />
          </div>

          <div className="grid-cards" style={{marginTop:'2rem', gridTemplateColumns:'repeat(auto-fit, minmax(400px, 1fr))'}}>
            <div className="glass-card" style={{height:'450px', padding:'1.5rem'}}>
               <h3 style={{marginBottom:'1rem'}}>{t.profit_revenue_trend}</h3>
               <Line 
                 data={{
                   labels: data.shop.chart.labels,
                   datasets: [
                     {
                       label: t.monthly_profit_tk,
                       data: data.shop.chart.profit,
                       borderColor: '#10B981',
                       backgroundColor: 'rgba(16, 185, 129, 0.1)',
                       fill: true,
                       tension: 0.4,
                     },
                     {
                       label: t.monthly_revenue_tk,
                       data: data.shop.chart.revenue,
                       borderColor: '#8B5CF6',
                       backgroundColor: 'rgba(139, 92, 246, 0.1)',
                       fill: true,
                       tension: 0.4,
                     }
                   ]
                 }} 
                 options={{responsive:true, maintainAspectRatio:false}} 
               />
            </div>
            <div className="glass-card" style={{height:'450px', padding:'1.5rem', display:'flex', flexDirection:'column', alignItems:'center'}}>
               <h3 style={{marginBottom:'1rem'}}>{t.parcel_success_rate}</h3>
               <div style={{width:'280px'}}>
                 <Pie 
                   data={{
                     labels: [t.delivered, t.returned, t.pending],
                     datasets: [{
                       data: [data.shop.delivered_parcels, data.shop.returned_parcels, data.shop.total_parcels - data.shop.delivered_parcels - data.shop.returned_parcels],
                       backgroundColor: ['#10B981', '#EF4444', '#F59E0B']
                     }]
                   }}
                 />
               </div>
            </div>
          </div>

          <div className="glass-card animate-slide-up" style={{marginTop:'2rem', padding:'1.5rem'}}>
             <h3 style={{marginBottom:'1rem'}}>{t.ad_perf}</h3>
             <div style={{height:'400px'}}>
               <Bar 
                 data={{
                   labels: [t.total_ad_budget, t.gen_revenue],
                   datasets: [{
                     label: t.amount_tk,
                     data: [data.shop.total_ad_spend, data.shop.total_ad_revenue],
                     backgroundColor: ['#F472B6', '#8B5CF6']
                   }]
                 }}
                 options={{responsive:true, maintainAspectRatio:false}}
               />
             </div>
          </div>
        </>
      )}
    </div>
  );
}
