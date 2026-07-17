import { ArrowLeft, Sparkles, ShieldCheck, Truck, HeartHandshake } from 'lucide-react';

export default function About({ onBack }) {
  return (
    <div className="cust-page about">
      <button className="back" onClick={onBack}><ArrowLeft size={16} /> Back to shop</button>
      <div className="about-hero">
        <span className="about-mark"><Sparkles size={22} /></span>
        <h2>Sivakumar Crackers</h2>
        <p className="muted">Safe, joyful celebrations — delivered to your doorstep.</p>
      </div>

      <p>We're a family-run crackers business bringing you quality sparklers, flower pots, gift boxes and festival combos at honest prices, straight from the manufacturers.</p>

      <div className="about-points">
        <div className="ap"><ShieldCheck size={18} /><div><b>Genuine & safe</b><span>Quality-checked stock, handled and packed with care.</span></div></div>
        <div className="ap"><Truck size={18} /><div><b>All over India</b><span>Your order reaches your nearby Delivery Hub, wherever you are.</span></div></div>
        <div className="ap"><HeartHandshake size={18} /><div><b>Personal service</b><span>We verify every order by hand — real people, no bots.</span></div></div>
      </div>

      <p className="muted sm" style={{ marginTop: 18 }}>Please celebrate responsibly — follow local safety guidelines and keep children supervised around fireworks.</p>
    </div>
  );
}
