let twilioClient = null;

if (process.env.TWILIO_ACCOUNT_SID && !process.env.TWILIO_ACCOUNT_SID.startsWith('ACxx')) {
  const twilio = require('twilio');
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

function formatDateTime(date) {
  const d = new Date(date);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${hh}:${mm} · ${String(d.getDate()).padStart(2,'0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

async function sendMessage(body) {
  if (!twilioClient) {
    console.log('=== WhatsApp Message (dev mode) ===');
    console.log(body);
    console.log('===================================');
    return { dev: true };
  }

  return twilioClient.messages.create({
    from: process.env.TWILIO_WA_FROM,
    to: process.env.HOST_WA_NUMBER,
    body,
  });
}

async function sendOrderNotification(order) {
  const itemLines = order.items
    .map(i => `  • ${i.name} ×${i.quantity} = NPR ${i.subtotal}`)
    .join('\n');

  const body = `🛍 NEW ORDER — ${order.id}

Guest : ${order.guest_name}
Phone : ${order.guest_phone}
Room  : ${order.room_number || 'Not specified'}
Pay   : ${order.payment_method}
Time  : ${order.delivery_pref || 'asap'}

Items:
${itemLines}

💰 TOTAL : NPR ${order.total_amount}
🕐 ${formatDateTime(order.created_at)}`;

  return sendMessage(body);
}

async function sendBookingNotification(booking) {
  const body = `📅 BOOKING REQUEST

Guest     : ${booking.guest_name}
Phone     : ${booking.guest_phone}
Check-in  : ${booking.checkin_date}
Check-out : ${booking.checkout_date}
Guests    : ${booking.guest_count || 'Not specified'}
Purpose   : ${booking.purpose || 'Not specified'}
Requests  : ${booking.requests || 'None'}`;

  return sendMessage(body);
}

module.exports = { sendOrderNotification, sendBookingNotification };
