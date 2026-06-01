export function SlotDisponivel({ hora, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        position:   'absolute',
        inset:      0,
        background: 'repeating-linear-gradient(45deg, var(--green-pale), var(--green-pale) 4px, #fff 4px, #fff 8px)',
        cursor:     'pointer',
        display:    'flex',
        alignItems: 'center',
        padding:    '0 8px',
        fontSize:   10,
        color:      'var(--avail-txt)',
        fontWeight: 700,
        transition: 'background .15s',
      }}
      onMouseOver={e => {
        e.currentTarget.style.background = 'var(--avail)';
        e.stopPropagation();
      }}
      onMouseOut={e => {
        e.currentTarget.style.background = 'repeating-linear-gradient(45deg, var(--green-pale), var(--green-pale) 4px, #fff 4px, #fff 8px)';
      }}
    >
      + {hora}
    </div>
  );
}
