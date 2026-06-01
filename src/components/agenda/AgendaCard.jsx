import { format } from 'date-fns';

const SPEC_COLORS = {
  Psicologia:     { bg: 'var(--psico-bg)', border: 'var(--psico)' },
  Nutricao:       { bg: 'var(--nutri-bg)', border: 'var(--nutri)' },
  Fonoaudiologia: { bg: 'var(--fono-bg)',  border: 'var(--fono)'  },
};

const STATUS_STYLE = {
  Agendado:   { color: 'var(--psico)',    icon: '●' },
  Confirmado: { color: 'var(--nutri)',    icon: '✓' },
  Realizado:  { color: 'var(--nutri)',    icon: '✓' },
  Cancelado:  { color: '#E05252',         icon: '×' },
  Falta:      { color: 'var(--fono)',     icon: '●' },
};

// Convenio: azul (conv) ou roxo (particular)
const TAG_CONV = { background: '#EBF4FA', color: '#1E6FA3' };
const TAG_PART = { background: '#F2EFFA', color: '#6B52A8' };

export function AgendaCard({ agendamento, onClick }) {
  const spec      = SPEC_COLORS[agendamento.especialidade] || SPEC_COLORS.Psicologia;
  const statusSt  = STATUS_STYLE[agendamento.status] || STATUS_STYLE.Agendado;
  const tagSt     = agendamento.convenioId ? TAG_CONV : TAG_PART;
  const horaStr   = agendamento.dataHora
    ? format(new Date(agendamento.dataHora), 'HH:mm')
    : '';

  return (
    <div
      onClick={() => onClick?.(agendamento)}
      style={{
        background:   spec.bg,
        borderLeft:   `3px solid ${spec.border}`,
        borderRadius: 5,
        padding:      '4px 7px',
        cursor:       'pointer',
        overflow:     'hidden',
        transition:   'box-shadow .15s, transform .15s',
      }}
      onMouseOver={e => {
        e.currentTarget.style.boxShadow  = '0 3px 14px rgba(0,0,0,.15)';
        e.currentTarget.style.transform  = 'translateX(1px)';
      }}
      onMouseOut={e => {
        e.currentTarget.style.boxShadow  = 'none';
        e.currentTarget.style.transform  = 'none';
      }}
    >
      {horaStr && (
        <div style={{ fontSize: 8.5, fontWeight: 700, color: 'var(--text-soft)', marginBottom: 1 }}>
          {horaStr}
        </div>
      )}
      <div style={{
        fontSize:     11,
        fontWeight:   700,
        color:        'var(--navy)',
        whiteSpace:   'nowrap',
        overflow:     'hidden',
        textOverflow: 'ellipsis',
        lineHeight:   1.2,
      }}>
        {agendamento.pacienteNome}
      </div>
      <span style={{
        display:       'inline-block',
        padding:       '1px 5px',
        borderRadius:  3,
        fontSize:      8,
        fontWeight:    700,
        marginTop:     2,
        textTransform: 'uppercase',
        ...tagSt,
      }}>
        {agendamento.convenioNome || 'Particular'}
      </span>
      <div style={{ fontSize: 8.5, fontWeight: 700, marginTop: 2, color: statusSt.color }}>
        {statusSt.icon} {agendamento.status}
      </div>
    </div>
  );
}
