import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const isConfiguredKey = (value?: string) => {
  if (!value || !value.trim()) return false;
  const trimmed = value.trim();
  return !/(YOUR_ACTUAL|replace_me|example|mock|placeholder)/i.test(trimmed);
};

const createMockOrderResponse = (amount: number, keyId?: string) => {
  const total = Number(amount || 0);
  const safeAmount = Number.isFinite(total) && total > 0 ? Math.round(total * 100) : 1000;
  const orderId = `mock_order_${Date.now()}`;

  return {
    orderId,
    amount: safeAmount,
    currency: "INR",
    keyId: keyId || "rzp_test_mock_key",
    mock: true,
    mode: "mock",
    message: "Razorpay test keys missing or invalid. Using mock mode for local development.",
  };
};

export async function POST(request: Request) {
  try {
    const { amount = 0 } = await request.json();

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const hasValidKeyId = isConfiguredKey(keyId);
    const hasValidKeySecret = isConfiguredKey(keySecret);

    if (!hasValidKeyId || !hasValidKeySecret) {
      return NextResponse.json(createMockOrderResponse(Number(amount), keyId), { status: 200 });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const orderAmount = Math.round(Number(amount || 10) * 100);
    const order = await razorpay.orders.create({
      amount: orderAmount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
      mock: false,
      mode: "live",
    });
  } catch (error: any) {
    console.error("Razorpay API Error:", error);
    const fallbackAmount = Number((await request.clone().json().catch(() => ({ amount: 0 }))).amount || 0);
    return NextResponse.json(
      createMockOrderResponse(fallbackAmount, process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID),
      { status: 200 }
    );
  }
}