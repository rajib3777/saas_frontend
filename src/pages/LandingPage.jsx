import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../context/LanguageContext';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const t = useTranslation();
  const { toggleLang, lang } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobileMenuOpen]);

  return (
    <div style={{minHeight:'100vh', display:'flex', flexDirection:'column', background:'var(--bg-color)', color:'var(--text-main)'}}>
      {/* TOP NAVIGATION */}
      <nav className="top-nav" style={{background:'rgba(248, 250, 252, 0.9)', boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
        <h1 className="text-gradient" style={{fontWeight:'800', fontSize:'1.8rem', margin:0, letterSpacing:'-0.5px'}}>{t.brand_name}</h1>
        
        <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} style={{fontSize:'2rem'}}>
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
        <div className={`nav-links ${isMobileMenuOpen ? 'open' : ''}`}>
          <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} style={{color:'var(--text-main)', textDecoration:'none', fontWeight:'500'}}>{t.how_it_works || 'Flow'}</a>
          <a href="#pricing" onClick={() => setIsMobileMenuOpen(false)} style={{color:'var(--text-main)', textDecoration:'none', fontWeight:'500'}}>{t.pricing}</a>
          <a href="#faq" onClick={() => setIsMobileMenuOpen(false)} style={{color:'var(--text-main)', textDecoration:'none', fontWeight:'500'}}>FAQ</a>
          <button onClick={toggleLang} style={{background:'none', border:'none', cursor:'pointer', fontWeight:'bold', color:'var(--secondary)'}}>
            {lang === 'en' ? 'BN' : 'EN'}
          </button>
          <Link to="/login" className="btn-secondary">{t.login}</Link>
          <Link to="/login" className="btn-primary" style={{boxShadow:'0 4px 15px rgba(124, 58, 237, 0.4)'}}>{t.signup}</Link>
        </div>
      </nav>
      
      <main style={{flex:1, paddingTop:'8rem'}}>
        {/* HERO SECTION */}
        <section style={{textAlign:'center', padding:'3rem 5%', maxWidth:'900px', margin:'0 auto'}} className="animate-slide-up">
          <h2 className="hero-title text-gradient" style={{fontSize:'3.5rem', fontWeight:'900', lineHeight:'1.2', marginBottom:'1.5rem', paddingBottom:'0.1em'}}>
            {t.hero_title}
          </h2>
          <p style={{fontSize:'1.2rem', color:'var(--text-muted)', marginBottom:'2.5rem', lineHeight:'1.6', maxWidth:'800px', margin:'0 auto 2.5rem'}}>
            {t.hero_subtitle}
          </p>
          <div style={{display:'flex', gap:'1.5rem', justifyContent:'center'}}>
            <Link to="/login" className="btn-primary" style={{fontSize:'1.1rem', padding:'1rem 2.5rem'}}>{t.subscribe_now}</Link>
            <a href="#how-it-works" className="btn-secondary" style={{fontSize:'1.1rem', padding:'1rem 2.5rem'}}>{t.explore_more}</a>
          </div>
        </section>

        {/* DASHBOARD MOCKUP */}
        <section style={{padding:'2rem 5%', textAlign:'center', marginTop:'1rem'}}>
          <div className="animate-float" style={{position:'relative', display:'inline-block'}}>
            <div style={{
              position:'absolute', top:'10%', left:'5%', right:'5%', bottom:'10%',
              background:'var(--primary)', filter:'blur(100px)', opacity:0.1, zIndex:-1
            }}></div>
            <img 
               src="/dashboard_mockup.png" 
               alt="Futuristic SaaS Dashboard" 
               style={{
                 width:'100%', maxWidth:'900px', height:'auto', borderRadius:'24px', 
                 border:'4px solid white', 
                 boxShadow:'0 25px 50px -12px rgba(124, 58, 237, 0.25)'
               }} 
            />
          </div>
        </section>

        {/* HOW IT WORKS / FLOW SECTION */}
        <section id="how-it-works" style={{padding:'6rem 5%', background:'white', marginTop:'4rem'}}>
          <div style={{maxWidth:'1000px', margin:'0 auto'}}>
            <h3 className="text-gradient" style={{fontSize:'2.5rem', textAlign:'center', marginBottom:'4rem'}}>{t.adv_title}</h3>
            
            <div style={{display:'flex', flexDirection:'column', gap:'3rem'}}>
              
              <div style={{display:'flex', gap:'2rem', alignItems:'center'}}>
                <div style={{background:'var(--primary)', color:'white', width:'60px', height:'60px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', fontWeight:'bold', flexShrink:0}}>1</div>
                <div>
                  <h4 style={{fontSize:'1.4rem', marginBottom:'0.5rem', color:'var(--text-main)'}}>{t.adv_1_title}</h4>
                  <p style={{color:'var(--text-muted)', lineHeight:'1.6'}}>{t.adv_1_desc}</p>
                </div>
              </div>

              <div style={{display:'flex', gap:'2rem', alignItems:'center'}}>
                <div style={{background:'var(--secondary)', color:'white', width:'60px', height:'60px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', fontWeight:'bold', flexShrink:0}}>2</div>
                <div>
                  <h4 style={{fontSize:'1.4rem', marginBottom:'0.5rem', color:'var(--text-main)'}}>{t.adv_2_title}</h4>
                  <p style={{color:'var(--text-muted)', lineHeight:'1.6'}}>{t.adv_2_desc}</p>
                </div>
              </div>

              <div style={{display:'flex', gap:'2rem', alignItems:'center'}}>
                <div style={{background:'var(--success)', color:'white', width:'60px', height:'60px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', fontWeight:'bold', flexShrink:0}}>3</div>
                <div>
                  <h4 style={{fontSize:'1.4rem', marginBottom:'0.5rem', color:'var(--text-main)'}}>{t.adv_3_title}</h4>
                  <p style={{color:'var(--text-muted)', lineHeight:'1.6'}}>{t.adv_3_desc}</p>
                </div>
              </div>

              <div style={{display:'flex', gap:'2rem', alignItems:'center'}}>
                <div style={{background:'var(--danger)', color:'white', width:'60px', height:'60px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', fontWeight:'bold', flexShrink:0}}>4</div>
                <div>
                  <h4 style={{fontSize:'1.4rem', marginBottom:'0.5rem', color:'var(--text-main)'}}>{t.adv_4_title}</h4>
                  <p style={{color:'var(--text-muted)', lineHeight:'1.6'}}>{t.adv_4_desc}</p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section id="pricing" style={{padding:'6rem 5%', maxWidth:'1200px', margin:'0 auto'}}>
           <h3 className="text-gradient" style={{fontSize:'2.5rem', textAlign:'center', marginBottom:'1rem'}}>{t.pricing_title}</h3>
           <p style={{textAlign:'center', color:'var(--text-muted)', marginBottom:'4rem'}}>{t.pricing_subtitle}</p>
           
           <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))', gap:'3rem', maxWidth:'900px', margin:'0 auto'}}>
             <div className="glass-card" style={{borderTop:'6px solid var(--primary)', textAlign:'center'}}>
                <h3 style={{fontSize:'1.5rem', marginBottom:'1rem'}}>{t.office_plan}</h3>
                <div style={{fontSize:'3rem', fontWeight:'900', color:'var(--text-main)', marginBottom:'2rem'}}>{t.tba} <span style={{fontSize:'1rem', color:'var(--text-muted)', fontWeight:'normal'}}>{t.per_month}</span></div>
                <ul style={{listStyle:'none', padding:0, textAlign:'left', gap:'1rem', display:'flex', flexDirection:'column', marginBottom:'2rem', color:'var(--text-muted)'}}>
                  <li>{t.op_f1}</li>
                  <li>{t.op_f2}</li>
                  <li>{t.op_f3}</li>
                  <li>{t.op_f4}</li>
                </ul>
                <Link to="/login" state={{ isSignup: true, plan: 'office' }} className="btn-primary" style={{width:'100%', display:'block', textAlign:'center'}}>{t.get_started}</Link>
             </div>

             <div className="glass-card" style={{borderTop:'6px solid var(--secondary)', textAlign:'center', transform:'scale(1.05)', boxShadow:'0 15px 35px rgba(6,182,212,0.15)'}}>
                <div style={{background:'var(--secondary)', color:'white', padding:'4px 12px', borderRadius:'12px', fontSize:'0.8rem', fontWeight:'bold', display:'inline-block', marginBottom:'1rem'}}>{t.most_popular}</div>
                <h3 style={{fontSize:'1.5rem', marginBottom:'1rem'}}>{t.shop_plan}</h3>
                <div style={{fontSize:'3rem', fontWeight:'900', color:'var(--text-main)', marginBottom:'2rem'}}>{t.tba} <span style={{fontSize:'1rem', color:'var(--text-muted)', fontWeight:'normal'}}>{t.per_month}</span></div>
                <ul style={{listStyle:'none', padding:0, textAlign:'left', gap:'1rem', display:'flex', flexDirection:'column', marginBottom:'2rem', color:'var(--text-muted)'}}>
                  <li>{t.sp_f1}</li>
                  <li>{t.sp_f2}</li>
                  <li>{t.sp_f3}</li>
                  <li>{t.sp_f4}</li>
                  <li>{t.sp_f5}</li>
                </ul>
                <Link to="/login" state={{ isSignup: true, plan: 'shop' }} className="btn-primary" style={{width:'100%', display:'block', textAlign:'center'}}>{t.get_started}</Link>
             </div>
           </div>
        </section>

        {/* SUPPORT / CTA SECTION */}
        <section style={{padding:'5rem 5%', background:'var(--primary)', color:'white', textAlign:'center'}}>
           <div style={{maxWidth:'700px', margin:'0 auto'}}>
             <h3 style={{fontSize:'2.2rem', marginBottom:'1rem', color:'white'}}>{t.support_title}</h3>
             <p style={{fontSize:'1.1rem', marginBottom:'2rem', opacity:0.9}}>{t.support_subtitle}</p>
             <form style={{display:'flex', gap:'1rem', justifyContent:'center'}}>
               <input type="tel" placeholder="+8801XXXXXXXXX" required style={{
                 padding:'1rem 1.5rem', borderRadius:'30px', border:'none', width:'100%', maxWidth:'400px', fontSize:'1rem'
               }} />
               <button type="button" className="btn-secondary" style={{
                 background:'white', color:'var(--primary)', borderColor:'white', borderRadius:'30px', padding:'1rem 2rem'
               }} onClick={()=>alert('Thanks! We will call you shortly.')}>{t.request_call}</button>
             </form>
           </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" style={{padding:'6rem 5%', background:'white'}}>
           <div style={{maxWidth:'800px', margin:'0 auto'}}>
             <h3 className="text-gradient" style={{fontSize:'2.5rem', textAlign:'center', marginBottom:'3rem'}}>{t.faq_title}</h3>
             <div style={{display:'flex', flexDirection:'column', gap:'1.5rem'}}>
                <div className="glass-card" style={{padding:'1.5rem', background:'var(--bg-color)'}}>
                   <h4 style={{fontSize:'1.1rem', color:'var(--primary)', marginBottom:'0.5rem'}}>{t.faq_q1}</h4>
                   <p style={{color:'var(--text-muted)', fontSize:'0.95rem'}}>{t.faq_a1}</p>
                </div>
                <div className="glass-card" style={{padding:'1.5rem', background:'var(--bg-color)'}}>
                   <h4 style={{fontSize:'1.1rem', color:'var(--primary)', marginBottom:'0.5rem'}}>{t.faq_q2}</h4>
                   <p style={{color:'var(--text-muted)', fontSize:'0.95rem'}}>{t.faq_a2}</p>
                </div>
                <div className="glass-card" style={{padding:'1.5rem', background:'var(--bg-color)'}}>
                   <h4 style={{fontSize:'1.1rem', color:'var(--primary)', marginBottom:'0.5rem'}}>{t.faq_q3}</h4>
                   <p style={{color:'var(--text-muted)', fontSize:'0.95rem'}}>{t.faq_a3}</p>
                </div>
             </div>
           </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer style={{
         background:'#f8fafc', borderTop:'1px solid var(--border-color)',
         padding:'4rem 5% 2rem', marginTop:'auto'
      }}>
         <div style={{maxWidth:'1200px', margin:'0 auto', display:'flex', flexWrap:'wrap', gap:'3rem', justifyContent:'space-between'}}>
            <div style={{maxWidth:'300px'}}>
               <h2 className="text-gradient" style={{fontSize:'1.5rem', marginBottom:'1rem', fontWeight:'bold'}}>{t.brand_name}</h2>
               <p style={{color:'var(--text-muted)', fontSize:'0.9rem', lineHeight:'1.6'}}>
                 {t.footer_desc}
               </p>
            </div>
            <div style={{display:'flex', gap:'4rem'}}>
              <div>
                 <h4 style={{color:'var(--text-main)', marginBottom:'1rem'}}>{t.platform}</h4>
                 <ul style={{listStyle:'none', padding:0, display:'flex', flexDirection:'column', gap:'0.5rem', color:'var(--text-muted)', fontSize:'0.9rem'}}>
                    <li><a href="#how-it-works" style={{color:'inherit', textDecoration:'none'}}>{t.how_it_works}</a></li>
                    <li><a href="#pricing" style={{color:'inherit', textDecoration:'none'}}>{t.pricing}</a></li>
                 </ul>
              </div>
              <div>
                 <h4 style={{color:'var(--text-main)', marginBottom:'1rem'}}>{t.legal}</h4>
                 <ul style={{listStyle:'none', padding:0, display:'flex', flexDirection:'column', gap:'0.5rem', color:'var(--text-muted)', fontSize:'0.9rem'}}>
                    <li>{t.tos}</li>
                    <li>{t.privacy}</li>
                    <li>{t.security}</li>
                 </ul>
              </div>
            </div>
         </div>
         <div style={{maxWidth:'1200px', margin:'3rem auto 0', paddingTop:'2rem', borderTop:'1px solid var(--border-color)', textAlign:'center', color:'var(--text-muted)', fontSize:'0.85rem'}}>
            &copy; {new Date().getFullYear()} {t.copyright}
         </div>
      </footer>

      {/* FLOATING CALL BUTTON */}
      <a 
        href="tel:+8801815311438" 
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          background: 'var(--primary)',
          color: 'white',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 15px rgba(124, 58, 237, 0.4)',
          textDecoration: 'none',
          fontSize: '1.5rem',
          zIndex: 1000,
          transition: 'transform 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        title="Call Support"
      >
        📞
      </a>
    </div>
  );
}
