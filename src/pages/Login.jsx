import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const ROTAS = {
  Admin:        '/agenda',
  Recepcao:     '/agenda',
  Profissional: '/minha-agenda',
  Paciente:     '/app',
};

function formatCpf(v) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0,3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`;
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
}

export default function Login() {
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const [cpf, setCpf]         = useState('');
  const [senha, setSenha]     = useState('');
  const [erro, setErro]       = useState('');
  const [busy, setBusy]       = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setBusy(true);
    try {
      const perfil = await login(cpf, senha);
      navigate(ROTAS[perfil] ?? '/agenda', { replace: true });
    } catch (err) {
      setErro(err.response?.data?.mensagem ?? 'CPF ou senha incorretos.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-page" style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      minHeight: '100vh',
      fontFamily: 'var(--font-lato)',
      color: 'var(--text-navy)',
    }}>

      {/* ══ ESQUERDA — identidade ══ */}
      <div className="login-left" style={{
        position: 'relative',
        background: 'linear-gradient(160deg, var(--sky-pale) 0%, var(--sky-mist) 60%, var(--cream) 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '52px 48px',
        overflow: 'hidden',
      }}>
        {/* Arcos dourados decorativos */}
        <div style={{ position:'absolute', width:420, height:420, top:-180, left:-180, borderRadius:'50%', border:'1px solid rgba(201,169,110,.2)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', width:260, height:260, bottom:40, right:-100, borderRadius:'50%', border:'1px solid rgba(201,169,110,.2)', pointerEvents:'none' }} />

        {/* Faíscas animadas */}
        <span className="login-spark">✦</span>
        <span className="login-spark">✦</span>
        <span className="login-spark">✦</span>

        {/* Folha aquarelada — topo direita */}
        <svg className="leaf-tr" style={{ position:'absolute', top:-10, right:-20, width:240, opacity:.75, pointerEvents:'none' }} viewBox="0 0 280 260" fill="none">
          <ellipse cx="70"  cy="55"  rx="36" ry="66" fill="#7DA8C9" fillOpacity=".38" transform="rotate(-38 70 55)"/>
          <ellipse cx="130" cy="35"  rx="26" ry="54" fill="#9BBDD6" fillOpacity=".3"  transform="rotate(-22 130 35)"/>
          <ellipse cx="185" cy="72"  rx="22" ry="46" fill="#6E9EBE" fillOpacity=".32" transform="rotate(-10 185 72)"/>
          <ellipse cx="235" cy="44"  rx="18" ry="38" fill="#8CB4CC" fillOpacity=".22" transform="rotate(6 235 44)"/>
          <ellipse cx="100" cy="108" rx="14" ry="32" fill="#7DA8C9" fillOpacity=".2"  transform="rotate(-52 100 108)"/>
          <path d="M55 25 Q75 78 95 125"    stroke="#7DA8C9" strokeWidth="1.4" strokeOpacity=".45" fill="none"/>
          <path d="M120 18 Q142 58 150 108" stroke="#9BBDD6" strokeWidth="1.1" strokeOpacity=".35" fill="none"/>
          <path d="M210 8 Q228 48 218 98"   stroke="#C9A96E" strokeWidth=".9"  strokeOpacity=".28" fill="none"/>
        </svg>

        {/* Folha aquarelada — inferior esquerda */}
        <svg className="leaf-bl" style={{ position:'absolute', bottom:-20, left:-20, width:210, opacity:.6, transform:'rotate(180deg) scaleX(-1)', pointerEvents:'none' }} viewBox="0 0 260 240" fill="none">
          <ellipse cx="70"  cy="55"  rx="36" ry="66" fill="#7DA8C9" fillOpacity=".38" transform="rotate(-38 70 55)"/>
          <ellipse cx="128" cy="34"  rx="26" ry="54" fill="#9BBDD6" fillOpacity=".28" transform="rotate(-22 128 34)"/>
          <ellipse cx="180" cy="70"  rx="22" ry="44" fill="#6E9EBE" fillOpacity=".3"  transform="rotate(-10 180 70)"/>
          <path d="M55 25 Q75 78 95 125" stroke="#7DA8C9" strokeWidth="1.4" strokeOpacity=".4" fill="none"/>
        </svg>

        {/* Folha lateral direita */}
        <svg style={{ position:'absolute', top:'42%', right:-10, width:120, opacity:.35, transform:'rotate(15deg)', pointerEvents:'none' }} viewBox="0 0 120 220" fill="none">
          <ellipse cx="50" cy="60"  rx="22" ry="52" fill="#7DA8C9" fillOpacity=".25" transform="rotate(-15 50 60)"/>
          <ellipse cx="70" cy="100" rx="16" ry="38" fill="#9BBDD6" fillOpacity=".2"  transform="rotate(5 70 100)"/>
          <path d="M45 20 Q60 80 65 150" stroke="#7DA8C9" strokeWidth="1" strokeOpacity=".35" fill="none"/>
        </svg>

        {/* Conteúdo central */}
        <div className="login-left-inner" style={{ position:'relative', zIndex:2, textAlign:'center' }}>

          {/* Logo */}
          <div style={{ display:'inline-flex', flexDirection:'column', alignItems:'center', marginBottom:30 }}>
            <div style={{
              width:78, height:78, borderRadius:'50%',
              background:'#fff', border:'2px solid var(--sky-light)',
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 6px 28px rgba(125,168,201,.25)',
              position:'relative', marginBottom:14,
            }}>
              <div style={{
                position:'absolute', inset:-6, borderRadius:'50%',
                border:'1px solid rgba(201,169,110,.3)',
              }} />
              <span style={{ fontFamily:'var(--font-serif)', fontSize:30, color:'var(--navy)', lineHeight:1 }}>Ψ</span>
            </div>
            <div style={{ textAlign:'center' }}>
              <span style={{ display:'block', fontSize:'9.5px', fontWeight:700, letterSpacing:'.3em', textTransform:'uppercase', color:'var(--sky)', marginBottom:3 }}>Clínica</span>
              <span style={{ display:'block', fontFamily:'var(--font-serif)', fontSize:28, fontWeight:700, color:'var(--navy)', lineHeight:1.05 }}>Equilíbrio</span>
              <span style={{ display:'block', fontFamily:'var(--font-serif)', fontSize:26, fontWeight:400, color:'var(--navy)', lineHeight:1.05 }}>
                Ideal <span style={{ color:'var(--gold)', fontSize:13 }}>✦</span>
              </span>
            </div>
          </div>

          {/* Divisor dourado */}
          <div style={{ display:'flex', alignItems:'center', gap:10, width:260, margin:'0 auto 24px' }}>
            <div style={{ flex:1, height:1, background:'linear-gradient(90deg, transparent, var(--gold-light), transparent)' }} />
            <span style={{ color:'var(--gold)', fontSize:12 }}>✦</span>
            <div style={{ flex:1, height:1, background:'linear-gradient(90deg, transparent, var(--gold-light), transparent)' }} />
          </div>

          {/* Tagline */}
          <p style={{ fontFamily:'var(--font-serif)', fontSize:15, color:'var(--text-soft)', fontWeight:400, marginBottom:4, letterSpacing:'.01em' }}>
            Cuidado que acolhe.
          </p>
          <p style={{ fontFamily:'var(--font-serif)', fontSize:20, fontStyle:'italic', color:'var(--sky)', fontWeight:400 }}>
            Presença que transforma.
          </p>

          {/* Especialidades */}
          <div style={{
            display:'flex', marginTop:34,
            border:'1px solid var(--border-sky)', borderRadius:14,
            overflow:'hidden', background:'rgba(255,255,255,.8)',
            backdropFilter:'blur(8px)',
            boxShadow:'0 4px 20px rgba(125,168,201,.1)',
          }}>
            {[
              { icon:'🧠', nome:'Psicologia',   desc:'Saúde mental' },
              { icon:'🥗', nome:'Nutrição',      desc:'Bem-estar'    },
              { icon:'🗣️', nome:'Fonoaudio.',    desc:'Comunicação'  },
            ].map((s, i, arr) => (
              <div key={s.nome} style={{
                flex:1, padding:'16px 10px', textAlign:'center',
                borderRight: i < arr.length - 1 ? '1px solid var(--border-sky)' : 'none',
              }}>
                <span style={{ fontSize:20, display:'block', marginBottom:5 }}>{s.icon}</span>
                <span style={{ display:'block', fontSize:10, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:'var(--navy)', marginBottom:2 }}>{s.nome}</span>
                <span style={{ display:'block', fontSize:10, color:'var(--text-soft)', fontWeight:300 }}>{s.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ DIREITA — formulário ══ */}
      <div className="login-right" style={{
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 44px',
        borderLeft: '1px solid var(--border-sky)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Lavagem azul suave — topo */}
        <div style={{ position:'absolute', top:-80, right:-80, width:320, height:320, borderRadius:'50%', background:'radial-gradient(circle, rgba(184,212,232,.25) 0%, transparent 70%)', pointerEvents:'none' }} />
        {/* Lavagem dourada — base */}
        <div style={{ position:'absolute', bottom:-60, left:-60, width:240, height:240, borderRadius:'50%', background:'radial-gradient(circle, rgba(201,169,110,.08) 0%, transparent 70%)', pointerEvents:'none' }} />

        <div className="login-form-box" style={{ position:'relative', zIndex:2, width:'100%', maxWidth:380 }}>

          {/* Cabeçalho */}
          <div style={{ marginBottom:30 }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.26em', textTransform:'uppercase', color:'var(--sky)', marginBottom:8 }}>
              Plataforma de Gestão
            </div>
            <h1 style={{ fontFamily:'var(--font-serif)', fontSize:32, fontWeight:600, color:'var(--navy)', lineHeight:1.1, marginBottom:6 }}>
              Olá,<br />bem-vindo <em style={{ fontStyle:'italic', fontWeight:400, color:'var(--sky)' }}>de volta</em>
            </h1>
            <p style={{ fontSize:13, color:'var(--text-soft)', fontWeight:300 }}>
              Entre com seu CPF e senha para continuar
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit}>

            {/* Campo CPF */}
            <div className="login-field" style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:'var(--text-soft)', marginBottom:6 }}>
                CPF
              </label>
              <div style={{ position:'relative' }}>
                <svg style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--sky-light)', pointerEvents:'none' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <input
                  type="text"
                  inputMode="numeric"
                  value={cpf}
                  onChange={(e) => setCpf(formatCpf(e.target.value))}
                  placeholder="000.000.000-00"
                  required
                  style={fieldStyle}
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div className="login-field" style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:'var(--text-soft)', marginBottom:6 }}>
                Senha
              </label>
              <div style={{ position:'relative' }}>
                <svg style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--sky-light)', pointerEvents:'none' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={fieldStyle}
                />
              </div>
            </div>

            {/* Mensagem de erro */}
            {erro && (
              <div style={{
                marginBottom:16, padding:'10px 14px',
                background:'#FFF5F5', border:'1px solid #FED7D7',
                borderRadius:8, color:'#C53030', fontSize:13,
              }}>
                {erro}
              </div>
            )}

            {/* Botão entrar */}
            <button
              type="submit"
              disabled={busy}
              className="login-btn-enter"
              style={{
                width:'100%', height:50, border:'none', borderRadius:10,
                background: busy ? 'var(--navy-mid)' : 'var(--navy)',
                color:'#fff', fontFamily:'var(--font-lato)', fontSize:13,
                fontWeight:700, letterSpacing:'.18em', textTransform:'uppercase',
                cursor: busy ? 'not-allowed' : 'pointer',
                boxShadow:'0 4px 18px rgba(27,58,92,.18)',
                transition:'background .2s, transform .15s',
                opacity: busy ? .75 : 1,
              }}
            >
              {busy ? 'Entrando…' : 'ENTRAR'}
            </button>
          </form>

          {/* Divisor */}
          <div style={{ display:'flex', alignItems:'center', gap:12, margin:'18px 0' }}>
            <div style={{ flex:1, height:1, background:'var(--border-sky)' }} />
            <span style={{ fontSize:11, color:'var(--text-soft)', letterSpacing:'.08em' }}>acesso rápido para pacientes</span>
            <div style={{ flex:1, height:1, background:'var(--border-sky)' }} />
          </div>

          {/* Botão WhatsApp */}
          <button
            type="button"
            className="login-btn-wpp"
            style={{
              width:'100%', height:46,
              border:'1.5px solid #b2e8c4', borderRadius:10,
              background:'#f0fff6', color:'#1a7a42',
              fontFamily:'var(--font-lato)', fontSize:13, fontWeight:400,
              cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              transition:'background .2s, border-color .2s',
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="#25D366">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
            </svg>
            Agendar via WhatsApp
          </button>

          {/* Rodapé */}
          <p style={{ textAlign:'center', marginTop:22, fontSize:11, color:'var(--text-soft)', lineHeight:1.7, fontWeight:300 }}>
            Santo André, SP &nbsp;·&nbsp;
            <a href="tel:1131100069" style={{ color:'var(--sky)', textDecoration:'none', fontWeight:700 }}>(11) 3110-0069</a>
            &nbsp;·&nbsp;
            <a href="#" style={{ color:'var(--sky)', textDecoration:'none', fontWeight:700 }}>clinicaequilibrioideal.com.br</a>
          </p>

        </div>
      </div>
    </div>
  );
}

const fieldStyle = {
  width: '100%',
  height: 48,
  padding: '0 16px 0 42px',
  border: '1.5px solid var(--border-sky)',
  borderRadius: 10,
  background: 'var(--sky-mist)',
  fontFamily: 'var(--font-lato)',
  fontSize: 14,
  color: 'var(--text-navy)',
  outline: 'none',
  transition: 'border-color .2s, background .2s, box-shadow .2s',
  boxSizing: 'border-box',
};
