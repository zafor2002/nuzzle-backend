import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiSuccess, apiError, handleOptions, withErrorHandler } from '@/lib/api-response';

export async function OPTIONS() {
  return handleOptions();
}

const checkoutSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().optional(),
      title: z.string(),
      price: z.number().positive(),
      quantity: z.number().int().positive().default(1),
    })
  ).min(1, 'Order must contain at least one item.'),
  shippingAddress: z.object({
    recipientName: z.string().min(2),
    phone: z.string().min(6),
    address: z.string().min(5),
    city: z.string().default('Dhaka'),
  }),
  paymentMethod: z.enum(['card', 'bkash', 'nagad', 'cash_on_delivery']).default('bkash'),
  currency: z.string().default('BDT'),
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const body = await req.json();
  const parsed = checkoutSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(parsed.error.issues[0].message, 400, parsed.error.issues);
  }

  const { items, shippingAddress, paymentMethod, currency } = parsed.data;

  // Calculate Subtotal & Taxes
  const subtotal = items.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const deliveryFee = 60; // BDT 60 standard city delivery
  const totalAmount = subtotal + deliveryFee;

  // Simulated Payment Gateway Transaction Processing
  const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const orderId = `ord_${Date.now()}`;

  const orderReceipt = {
    orderId,
    transactionId,
    status: 'PAID',
    paymentStatus: paymentMethod === 'cash_on_delivery' ? 'PENDING_ON_DELIVERY' : 'CONFIRMED',
    paymentGateway: paymentMethod === 'bkash' ? 'bKash Merchant Gateway' : paymentMethod === 'nagad' ? 'Nagad Direct' : 'Global SSLCommerz / Stripe',
    currency,
    items,
    itemCount: items.length,
    subtotal,
    deliveryFee,
    totalAmount,
    shippingAddress,
    placedAt: new Date().toISOString(),
    estimatedDelivery: 'Tomorrow, 10:00 AM - 6:00 PM',
  };

  return apiSuccess(orderReceipt, 201, 'Payment processed and marketplace order placed successfully.');
});
