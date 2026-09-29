import { ShoppingCart, MapPin, ClipboardCheck, Smartphone, ShieldCheck, Truck } from 'lucide-react';
import PageIntro from '../PageIntro';

const STEPS = [
  { icon: ShoppingCart, title: 'Add to cart', text: 'Browse crackers and add what you like. Minimum order is ₹3,500.' },
  { icon: MapPin, title: 'Add your location', text: 'Sign in and save your delivery address (you can keep up to 5).' },
  { icon: ClipboardCheck, title: 'Place the order', text: 'Confirm your location and review your order summary.' },
  { icon: Smartphone, title: 'Pay & upload', text: 'Pay the exact amount by UPI, then upload the payment screenshot.' },
  { icon: ShieldCheck, title: 'We verify', text: 'Our team checks your payment by hand and confirms the order.' },
  { icon: Truck, title: 'Track it', text: 'Follow your order to your nearby Delivery Hub — delivered all over India.' },
];

export default function HowToOrder() {
  return (
    <div className="cust-page">
      <PageIntro icon={ShoppingCart} eyebrow="YOUR CELEBRATION STARTS HERE" title="A few steps to festive joy.">From choosing your favourites to collecting your order, here’s how it works.</PageIntro>
      <div className="page-facts"><span>Minimum order <b>₹3,500</b></span><span>Payment <b>UPI / bank transfer</b></span><span>Order by <b>October 20</b></span></div>
      <div className="steps-flow">
        {STEPS.map((st, i) => (
          <div className="stepr" key={st.title}>
            <div className="stepr-n"><st.icon size={18} /></div>
            <div className="stepr-body">
              <div className="stepr-title"><span className="stepr-num">{i + 1}</span> {st.title}</div>
              <div className="muted sm">{st.text}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="page-note"><ShieldCheck size={20} /><p>Keep your payment screenshot handy. Our team verifies your transfer and updates your order status after confirmation.</p></div>
    </div>
  );
}
