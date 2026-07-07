export function CouncilLogo({ size = 22, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 30 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style} className={className}>
      <line x1="15" y1="2" x2="15" y2="22" strokeWidth="1.2"/>
      <line x1="9" y1="22" x2="21" y2="22" strokeWidth="1.4"/>
      <line x1="3" y1="7" x2="27" y2="7" strokeWidth="1.2"/>
      <path d="M3 7 Q2.5 13 6 13.5 Q9.5 13.5 9 7" strokeWidth="1.1"/>
      <path d="M21 7 Q20.5 14 24 14.5 Q27.5 14.5 27 7" strokeWidth="1.1"/>
    </svg>
  );
}
