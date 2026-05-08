import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const expectedAmount = Number(formData.get('amount'));

    if (!file || !expectedAmount) {
      return NextResponse.json({ error: 'Missing file or amount' }, { status: 400 });
    }

    // Prepare FormData for Thunder API
    const thunderFormData = new FormData();
    thunderFormData.append('file', file);

    const THUNDER_API_KEY = process.env.THUNDER_API_KEY;
    if (!THUNDER_API_KEY || THUNDER_API_KEY === 'your_thunder_api_key_here') {
      return NextResponse.json({ error: 'Thunder API Key is not configured in .env' }, { status: 500 });
    }

    // Call Thunder API (v1 file upload endpoint)
    const thunderRes = await fetch('https://api.thunder.in.th/v1/verify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${THUNDER_API_KEY}`
      },
      body: thunderFormData
    });

    const thunderData = await thunderRes.json();

    // Support both API v1 and v2 formats
    const isSuccess = thunderData.success ?? (thunderData.status === 200 || thunderData.status === 'success');
    const responseData = thunderData.data || thunderData;

    if (!isSuccess) {
      return NextResponse.json({ 
        error: 'Slip verification failed', 
        details: thunderData.message || thunderData.error?.message || 'Invalid slip'
      }, { status: 400 });
    }

    const slipAmount = Number(responseData.amount);
    const slipRef = responseData.transRef || responseData.referenceNo || responseData.ref;

    if (!slipRef) {
      return NextResponse.json({ error: 'Could not extract reference number from slip' }, { status: 400 });
    }

    // 1. Verify Amount
    if (slipAmount < expectedAmount) {
      return NextResponse.json({ error: `Amount mismatch. Expected ฿${expectedAmount} but slip is ฿${slipAmount}` }, { status: 400 });
    }

    // 2. Verify Receiver (ป้องกันเอาสลิปโอนเงินให้คนอื่นมาเติม)
    // เช็คว่า proxyId (พร้อมเพย์) หรือ account (เลขบัญชี) ตรงกับของเราหรือไม่
    const receiver = responseData.receiver || {};
    const merchantPromptPay = process.env.PROMPTPAY_ID?.replace(/-/g, '');
    
    // ดึงค่าผู้รับออกมา (บางธนาคารให้ proxyId บางที่ให้ accountTo)
    const slipReceiverId = (receiver.proxyId || receiver.accountTo || receiver.account || '').toString().replace(/-/g, '');
    
    // ถ้าตั้งค่า PROMPTPAY_ID ไว้ใน .env และในสลิปมีข้อมูลผู้รับ ให้ตรวจสอบว่าตรงกันไหม
    if (merchantPromptPay && slipReceiverId && !slipReceiverId.includes(merchantPromptPay)) {
        return NextResponse.json({ 
            error: 'Invalid receiver', 
            details: 'สลิปนี้ไม่ได้โอนเข้าบัญชีที่กำหนด (Merchant Account Mismatch)' 
        }, { status: 400 });
    }

    // 3. Prevent duplicate slip usage
    const existingTransaction = await prisma.transaction.findUnique({
      where: { slipRef: slipRef.toString() }
    });

    if (existingTransaction) {
      return NextResponse.json({ error: 'This slip has already been used.' }, { status: 400 });
    }

    // 4. Process top-up
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Calculate coins
    const EXCHANGE_RATE = 10;
    const baseCoins = expectedAmount * EXCHANGE_RATE;
    let bonusPercent = 0;
    if (expectedAmount >= 999) bonusPercent = 15;
    else if (expectedAmount >= 499) bonusPercent = 10;
    else if (expectedAmount >= 199) bonusPercent = 5;
    const totalCoins = baseCoins + Math.floor(baseCoins * (bonusPercent / 100));

    // Transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { coinBalance: { increment: totalCoins } }
      });

      const newTx = await tx.transaction.create({
        data: {
          userId: user.id,
          type: 'TOPUP_SLIP',
          amount: totalCoins,
          balanceAfter: updatedUser.coinBalance,
          description: `Top Up ฿${expectedAmount} via PromptPay Slip`,
          slipRef: slipRef.toString(),
          status: 'COMPLETED'
        }
      });

      return { user: updatedUser, transaction: newTx };
    });

    return NextResponse.json({ 
      success: true, 
      coinsAdded: totalCoins,
      newBalance: result.user.coinBalance
    });

  } catch (error: any) {
    console.error('Verify Slip Error:', error);
    return NextResponse.json({ error: 'Internal server error', message: error.message }, { status: 500 });
  }
}
