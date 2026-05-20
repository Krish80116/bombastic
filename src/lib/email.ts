import { Resend } from 'resend';

let cached: Resend | null = null;

function getResend(): Resend {
  if (cached) return cached;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY not configured');
  cached = new Resend(key);
  return cached;
}

export type OrderEmailData = {
  receiptId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  amountInPaise: number;
  customer: {
    fullName: string;
    email: string;
    phone: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    pincode: string;
  };
  lines: Array<{ name: string; size: string; qty: number; lineTotalInr: number }>;
};

function formatRupees(paise: number): string {
  return (paise / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
}

function renderOrderHtml(data: OrderEmailData): string {
  const linesHtml = data.lines
    .map(
      (l) =>
        `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee">${l.name} — ${l.size} × ${l.qty}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right">₹ ${l.lineTotalInr.toLocaleString('en-IN')}</td></tr>`,
    )
    .join('');
  return `
<div style="font-family:Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0a0a0a">
  <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#666">Bombastic — Order Confirmed</div>
  <h1 style="font-size:28px;margin:16px 0 4px">Thanks for your order.</h1>
  <div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:#666">Receipt: ${data.receiptId}</div>
  <table style="width:100%;border-collapse:collapse;margin-top:24px">${linesHtml}</table>
  <div style="display:flex;justify-content:space-between;margin-top:16px;font-weight:600"><span>Total</span><span>${formatRupees(data.amountInPaise)}</span></div>
  <div style="margin-top:32px;font-size:13px;line-height:1.6">
    <strong>Shipping to</strong><br>
    ${data.customer.fullName}<br>
    ${data.customer.addressLine1}${data.customer.addressLine2 ? '<br>' + data.customer.addressLine2 : ''}<br>
    ${data.customer.city}, ${data.customer.state} — ${data.customer.pincode}<br>
    ${data.customer.phone}
  </div>
  <p style="margin-top:32px;font-size:12px;color:#666">Drop a reply to this email if anything needs fixing. We ship within 3 business days.</p>
</div>`;
}

export async function sendOrderEmails(data: OrderEmailData): Promise<void> {
  const from = process.env.EMAIL_FROM;
  const ownerAddr = process.env.ORDER_NOTIFICATION_EMAIL;
  if (!from || !ownerAddr) throw new Error('Email env not configured');

  const html = renderOrderHtml(data);
  const subject = `Bombastic — order ${data.receiptId}`;
  const resend = getResend();

  await resend.emails.send({
    from,
    to: data.customer.email,
    subject,
    html,
  });

  await resend.emails.send({
    from,
    to: ownerAddr,
    subject: `[NEW ORDER] ${data.receiptId} — ${data.customer.fullName}`,
    html,
  });
}
