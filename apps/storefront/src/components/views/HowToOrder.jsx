import { ShoppingCart, MapPin, ClipboardCheck, Smartphone, ShieldCheck, Truck } from 'lucide-react';

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
      <h2 className="page-title">How to order</h2>
      <p className="muted" style={{ marginTop: -8, marginBottom: 18 }}>Ordering is simple — here's the whole flow.</p>
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
      <p className="muted sm" style={{ marginTop: 18 }}>Payments are manual (UPI / bank transfer) and verified by our team — there's no online payment gateway, so your money always goes straight to us.</p>
    </div>
  );
}
