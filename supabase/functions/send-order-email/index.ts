import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface OrderItem {
  product_name: string;
  size_label: string;
  quantity: number;
  unit_price: number;
  extras: Array<{ label: string; price: number }>;
}

interface OrderPayload {
  orderId: string;
  customerName: string;
  customerEmail: string;
  orderType: string;
  paymentMethod: string;
  deliveryAddress: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  createdAt: string;
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function buildTicketHtml(order: OrderPayload): string {
  const itemsRows = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid #f0e6d6;">
            <strong>${item.product_name}</strong><br/>
            <span style="color:#92441c;font-size:13px;">${item.size_label}${
        item.extras.length > 0
          ? " · " + item.extras.map((e) => e.label).join(", ")
          : ""
      }</span>
          </td>
          <td style="padding:10px 14px;border-bottom:1px solid #f0e6d6;text-align:center;">${item.quantity}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #f0e6d6;text-align:right;font-weight:600;">${formatPrice(item.unit_price * item.quantity)}</td>
        </tr>
      `
    )
    .join("");

  const created = new Date(order.createdAt).toLocaleString("es-ES", {
    dateStyle: "long",
    timeStyle: "short",
  });

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;background:#fdf8f3;border-radius:16px;overflow:hidden;border:1px solid #f0e6d6;">
    <div style="background:linear-gradient(135deg,#dc2626,#b1581f);padding:28px 32px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:26px;">🍕 PizzApp</h1>
      <p style="color:#fde4e2;margin:6px 0 0;font-size:14px;">Confirmación de pedido</p>
    </div>
    <div style="padding:24px 32px;">
      <h2 style="color:#61301b;margin:0 0 4px;font-size:20px;">¡Gracias por tu pedido, ${order.customerName}!</h2>
      <p style="color:#63665f;font-size:14px;margin:0 0 20px;">
        Hemos recibido tu pedido y lo estamos preparando con mucho cariño.
      </p>

      <div style="background:#f9ecdc;border-radius:10px;padding:14px 18px;margin-bottom:20px;font-size:13px;color:#4d504a;">
        <p style="margin:0 0 6px;"><strong>Pedido #:</strong> ${order.orderId.slice(0, 8).toUpperCase()}</p>
        <p style="margin:0 0 6px;"><strong>Fecha:</strong> ${created}</p>
        <p style="margin:0 0 6px;"><strong>Entrega:</strong> ${order.orderType === "domicilio" ? "Domicilio" : "Recoger en tienda"}</p>
        <p style="margin:0 0 6px;"><strong>Pago:</strong> ${order.paymentMethod === "efectivo" ? "Efectivo" : "Tarjeta"}</p>
        ${order.deliveryAddress ? `<p style="margin:0;"><strong>Dirección:</strong> ${order.deliveryAddress}</p>` : ""}
      </div>

      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#343531;">
        <thead>
          <tr style="background:#f0e6d6;">
            <th style="padding:10px 14px;text-align:left;">Producto</th>
            <th style="padding:10px 14px;text-align:center;">Cant.</th>
            <th style="padding:10px 14px;text-align:right;">Precio</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <div style="margin-top:16px;padding:14px 0;border-top:2px solid #f0e6d6;font-size:14px;color:#4d504a;">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
          <span>Subtotal</span><span>${formatPrice(order.subtotal)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
          <span>Domicilio</span><span>${order.deliveryFee > 0 ? formatPrice(order.deliveryFee) : "Gratis"}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
          <span>Impuestos (10%)</span><span>${formatPrice(order.tax)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding-top:10px;border-top:1px solid #f0e6d6;font-size:18px;font-weight:bold;color:#61301b;">
          <span>Total</span><span>${formatPrice(order.total)}</span>
        </div>
      </div>

      ${
        order.orderType === "domicilio"
          ? `<p style="background:#e3f5e7;color:#1f6736;border-radius:10px;padding:12px 16px;font-size:13px;margin-top:20px;">🚀 Tu pedido llegará a tu dirección en aproximadamente 30-40 minutos.</p>`
          : `<p style="background:#e3f5e7;color:#1f6736;border-radius:10px;padding:12px 16px;font-size:13px;margin-top:20px;">⏰ Tu pedido estará listo para recoger en aproximadamente 20 minutos.</p>`
      }
    </div>
    <div style="background:#343531;padding:16px 32px;text-align:center;">
      <p style="color:#aeb0ad;font-size:12px;margin:0;">© ${new Date().getFullYear()} PizzApp · Pizzas artesanales a la leña</p>
    </div>
  </div>
  `;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const order: OrderPayload = await req.json();

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY secret is not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const html = buildTicketHtml(order);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "PizzApp <onboarding@resend.dev>",
        to: "joeljoseline1992@gmail.com",
        subject: `🍕 Nuevo pedido #${order.orderId.slice(0, 8).toUpperCase()} — ${order.customerName}`,
        html,
      }),
    });

    if (!emailResponse.ok) {
      const errText = await emailResponse.text();
      console.error("Resend API error:", emailResponse.status, errText);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: errText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
