export default function PageIntro({ icon: Icon, eyebrow, title, children }) {
  return (
    <div className="page-intro">
      <span className="page-intro-icon"><Icon size={26} aria-hidden="true" /></span>
      <div><span className="section-kicker">{eyebrow}</span><h2>{title}</h2><p>{children}</p></div>
    </div>
  );
}
