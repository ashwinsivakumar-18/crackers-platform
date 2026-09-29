import { ArrowLeft, Sparkles, ShieldCheck, Truck, HeartHandshake } from 'lucide-react';
import PageIntro from '../PageIntro';

export default function About({ onBack }) {
  return (
    <div className="cust-page about">
      <button className="back" onClick={onBack}><ArrowLeft size={16} /> Back to shop</button>
      <PageIntro icon={Sparkles} eyebrow="THE PEOPLE BEHIND YOUR CELEBRATION" title="A little sparkle. A personal touch.">Sivakumar Crackers · Festive favourites from Sivakasi.</PageIntro>

      <div className="story-panel"><span className="section-kicker">OUR STORY</span><h3>Made for moments together.</h3><p>We're a family-run crackers business bringing you sparklers, flower pots, gift boxes and festival favourites, straight from the manufacturers. Whether you’re planning a family celebration or gifts for your whole team, we’re here to help you choose.</p></div>

      <div className="about-points">
        <div className="ap"><ShieldCheck size={18} /><div><b>Genuine & safe</b><span>Quality-checked stock, handled and packed with care.</span></div></div>
        <div className="ap"><Truck size={18} /><div><b>All over India</b><span>Your order reaches your nearby Delivery Hub, wherever you are.</span></div></div>
        <div className="ap"><HeartHandshake size={18} /><div><b>Personal service</b><span>We verify every order by hand — real people, no bots.</span></div></div>
      </div>

      <p className="muted sm" style={{ marginTop: 18 }}>Please celebrate responsibly — follow local safety guidelines and keep children supervised around fireworks.</p>
    </div>
  );
}
