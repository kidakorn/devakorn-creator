/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import generatePayload from 'promptpay-qr';

export async function POST(req: Request) {
  try {
    const { amount } = await req.json();
    if (!amount) {
      return NextResponse.json({ error: 'Amount is required' }, { status: 400 });
    }

    const promptpayId = process.env.PROMPTPAY_ID;
    const promptpayName = process.env.PROMPTPAY_NAME || 'Devakorn Creator';

    if (!promptpayId) {
      return NextResponse.json({ error: 'PROMPTPAY_ID is not configured in server' }, { status: 500 });
    }

    const payload = generatePayload(promptpayId, { amount: Number(amount) });
    
    return NextResponse.json({ 
      payload, 
      promptpayName,
      amount: Number(amount)
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error', message: error.message }, { status: 500 });
  }
}
