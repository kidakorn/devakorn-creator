/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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
    const transDateStr = responseData.transDate || responseData.date;
    const transTimeStr = responseData.transTime || responseData.time;

    if (!slipRef) {
      return NextResponse.json({ error: 'Could not extract reference number from slip' }, { status: 400 });
    }

    // Check date-time slip
    if (transDateStr && transTimeStr) {
      // API Thunder มักส่งมาในรูปแบบ Date: "20240510", Time: "13:17:00"
      const year = parseInt(transDateStr.substring(0, 4));
      const month = parseInt(transDateStr.substring(4, 6)) - 1; // เดือนใน JS เริ่มที่ 0
      const day = parseInt(transDateStr.substring(6, 8));

      const parts = transTimeStr.split(':');
      const hour = parseInt(parts[0]);
      const min = parseInt(parts[1]);
      const sec = parseInt(parts[2] || '0');

      const slipTimestamp = new Date(year, month, day, hour, min, sec).getTime();
      const currentTimestamp = Date.now();

      // คำนวณความห่างของเวลา (หน่วยเป็นมิลลิวินาที)
      const diffInMs = currentTimestamp - slipTimestamp;
      const diffInMinutes = diffInMs / (1000 * 60);

      // กฎข้อที่ 1: สลิปต้องมีอายุไม่เกิน 15 นาที
      if (diffInMinutes > 15) {
        return NextResponse.json({
          error: 'สลิปหมดอายุแล้ว',
          details: `กรุณาทำรายการโอนเงินใหม่ เนื่องจากสลิปมีอายุเกิน 15 นาที`
        }, { status: 400 });
      }

      // กฎข้อที่ 2: สลิปต้องไม่ใช่ของอนาคต (เผื่อเครื่องตั้งเวลาเพี้ยน ยอมให้ต่างได้ 2 นาที)
      if (diffInMinutes < -2) {
        return NextResponse.json({
          error: 'เวลาในสลิปไม่ถูกต้อง',
          details: 'ไม่สามารถตรวจสอบเวลาในสลิปได้ กรุณาลองใหม่อีกครั้ง'
        }, { status: 400 });
      }
    } else {
      // ถ้าระบบดึงวันที่/เวลาจากสลิปไม่ได้ ให้บล็อกไว้ก่อนเพื่อความปลอดภัย
      return NextResponse.json({ error: 'Could not extract timestamp from slip' }, { status: 400 });
    }

    // 1. Verify Amount
    if (slipAmount < expectedAmount) {
      return NextResponse.json({ error: `Amount mismatch. Expected ฿${expectedAmount} but slip is ฿${slipAmount}` }, { status: 400 });
    }

    // 2. Verify Receiver (ป้องกันเอาสลิปโอนเงินให้คนอื่นมาเติม)
    // เช็คว่า proxyId (พร้อมเพย์) หรือ account (เลขบัญชี) ตรงกับของเราหรือไม่
    const receiver = responseData.receiver || {};
    let merchantPromptPay = process.env.PROMPTPAY_ID?.replace(/-/g, '');

    // ถ้าเบอร์มือถือขึ้นต้นด้วย 0 ให้ตัด 0 ออก เพื่อรองรับกรณีที่ API ส่งกลับมาเป็นรหัสประเทศ (66)
    if (merchantPromptPay && merchantPromptPay.startsWith('0') && merchantPromptPay.length === 10) {
      merchantPromptPay = merchantPromptPay.substring(1);
    }

    // แปลง object ผู้รับให้อยู่ในรูป String เพื่อป้องกันปัญหา [object Object]
    const slipReceiverRaw = JSON.stringify(receiver);
    let isMatch = false;

    if (merchantPromptPay) {
      if (slipReceiverRaw.includes(merchantPromptPay)) {
        // กรณีเจอเบอร์ตรงๆ ใน JSON (ทั้งแบบมี 0 และไม่มี 0 นำหน้า เพราะ merchantPromptPay ตัด 0 ออกไปแล้ว)
        isMatch = true;
      } else {
        // กรณี API ส่งค่าเซ็นเซอร์มา เช่น "xxx-xxx-6314" หรือมีรหัสธนาคารปนมา
        // ให้ดึง "ตัวเลขที่ติดกัน 3 ตัวขึ้นไป" ออกมาเช็คทั้งหมดว่า merchantPromptPay ลงท้ายด้วยตัวเลขชุดนี้หรือไม่
        const numberGroups = slipReceiverRaw.match(/\d{3,}/g) || [];
        for (const num of numberGroups) {
          if (merchantPromptPay.endsWith(num)) {
            isMatch = true;
            break;
          }
        }
      }
    } else {
      isMatch = true; // กรณีที่ไม่ได้ตั้งค่า PROMPTPAY_ID
    }

    // ถ้าตั้งค่า PROMPTPAY_ID ไว้ใน .env และไม่ตรงกัน
    if (!isMatch) {
      return NextResponse.json({
        error: 'บัญชีผู้รับไม่ถูกต้อง',
        details: `สลิปนี้ไม่ได้โอนเข้าบัญชีของ Devakorn AI กรุณาตรวจสอบอีกครั้ง`
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
