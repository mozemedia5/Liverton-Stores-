import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight, CheckCircle2, PackageSearch, ShieldCheck } from "lucide-react";

export default function OrderTrackingPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="tracking-page page-wrap narrow">
      <div className="page-header">
        <span className="eyebrow"><PackageSearch size={14} /> Order care</span>
        <h1>Follow your <span>parcel.</span></h1>
        <p>Enter the details from your order confirmation and we’ll help you find the latest delivery information.</p>
      </div>
      <div className="tracking-layout">
        <section className="tracking-card">
          {submitted ? (
            <div className="tracking-success" role="status" aria-live="polite">
              <CheckCircle2 size={30} />
              <h2>Your request is ready.</h2>
              <p>For privacy, live order details are confirmed through Shopify or our support team. Check your confirmation email first, then contact us if you still need help.</p>
              <div className="tracking-actions"><Link href="/support" className="cta-button">Visit support <ArrowRight size={15} /></Link><button className="quiet-link" onClick={() => setSubmitted(false)}>Try another order</button></div>
            </div>
          ) : (
            <form className="tracking-form" onSubmit={(event) => { event.preventDefault(); if (orderNumber.trim() && email.trim()) setSubmitted(true); }}>
              <label>Order number<input required value={orderNumber} onChange={(event) => setOrderNumber(event.target.value)} placeholder="For example, #1001" /></label>
              <label>Email used at checkout<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>
              <button className="cta-button" type="submit">Find my order <ArrowRight size={15} /></button>
              <p className="tracking-note"><ShieldCheck size={15} /> We only use these details to help locate your order.</p>
            </form>
          )}
        </section>
        <aside className="tracking-aside">
          <span className="eyebrow">A considered handoff</span>
          <h2>From our edit to your door.</h2>
          <p>Shopify remains the secure source for checkout and fulfillment. Your confirmation email contains the most accurate carrier link once your parcel leaves the studio.</p>
          <Link href="/products" className="text-link">Continue shopping <ArrowRight size={15} /></Link>
        </aside>
      </div>
    </main>
  );
}
