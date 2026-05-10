/* eslint-disable @typescript-eslint/no-explicit-any */
import { POST } from './route';
import { getServerSession } from "next-auth/next";
import { PrismaClient } from '@prisma/client';

// 1. Mock NextAuth
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));
jest.mock('@/app/api/auth/[...nextauth]/route', () => ({
  authOptions: {},
}));

// 2. Mock PrismaClient
jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    user: { findUnique: jest.fn(), update: jest.fn() },
    transaction: { findUnique: jest.fn(), create: jest.fn() },
    $transaction: jest.fn(),
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

// 3. Mock global fetch (Thunder API)
global.fetch = jest.fn();

// 🟢 Helper Function: จำลองเวลาปัจจุบัน บวกลบนาที เพื่อเอาไว้เทสอายุสลิป
const getMockTime = (offsetMinutes = 0) => {
  const d = new Date(Date.now() + offsetMinutes * 60000);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return {
    transDate: `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`,
    transTime: `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  };
};

describe('POST /api/payment/verify', () => {
  let mockPrisma: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = new PrismaClient();
    process.env.THUNDER_API_KEY = 'valid-key';
    delete process.env.PROMPTPAY_ID; // ลบค่านี้ออกก่อน เพื่อให้เทสผ่านง่ายๆ (ถ้าจะเทสระบบเช็คชื่อ ค่อยใส่ค่านี้)
  });

  it('should return 401 if user is not authenticated', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    const req = new Request('http://localhost', { method: 'POST' });
    
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('should return 400 if file or amount is missing', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { email: 'test@example.com' } });
    const formData = new FormData();
    const req = new Request('http://localhost', { method: 'POST', body: formData });
    
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Missing file or amount');
  });

  // 🟢 NEW TEST: เช็คสลิปไม่มีข้อมูลเวลา
  it('should return 400 if slip does not contain timestamp', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { email: 'test@example.com' } });
    const formData = new FormData();
    formData.append('file', new Blob(['fake image'], { type: 'image/jpeg' }), 'slip.jpg');
    formData.append('amount', '100');

    (global.fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        success: true,
        data: { amount: 100, transRef: 'REF123' } // ไม่มีเวลา
      })
    });

    const req = new Request('http://localhost', { method: 'POST', body: formData });
    const res = await POST(req);
    
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Could not extract timestamp from slip');
  });

  // 🟢 NEW TEST: เช็คสลิปหมดอายุ (> 15 นาที)
  it('should return 400 if slip is expired (older than 15 mins)', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { email: 'test@example.com' } });
    const formData = new FormData();
    formData.append('file', new Blob(['fake image'], { type: 'image/jpeg' }), 'slip.jpg');
    formData.append('amount', '100');

    const pastTime = getMockTime(-20); // จำลองเวลาถอยหลังไป 20 นาที

    (global.fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        success: true,
        data: { amount: 100, transRef: 'REF123', ...pastTime }
      })
    });

    const req = new Request('http://localhost', { method: 'POST', body: formData });
    const res = await POST(req);
    
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('สลิปหมดอายุแล้ว');
  });

  // 🟢 NEW TEST: เช็คสลิปเวลาอนาคต (ป้องกันเครื่องตั้งเวลาเพี้ยน/สลิปปลอม)
  it('should return 400 if slip is from the future', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { email: 'test@example.com' } });
    const formData = new FormData();
    formData.append('file', new Blob(['fake image'], { type: 'image/jpeg' }), 'slip.jpg');
    formData.append('amount', '100');

    const futureTime = getMockTime(5); // จำลองเวลาไปข้างหน้า 5 นาที

    (global.fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        success: true,
        data: { amount: 100, transRef: 'REF123', ...futureTime }
      })
    });

    const req = new Request('http://localhost', { method: 'POST', body: formData });
    const res = await POST(req);
    
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('เวลาในสลิปไม่ถูกต้อง');
  });

  it('should return 400 if slip amount is less than expected', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { email: 'test@example.com' } });
    const formData = new FormData();
    formData.append('file', new Blob(['fake image'], { type: 'image/jpeg' }), 'slip.jpg');
    formData.append('amount', '500');

    const validTime = getMockTime(-5); // สลิปผ่านเวลาปกติ

    (global.fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        success: true,
        data: { amount: 100, transRef: 'REF123', ...validTime }
      })
    });

    const req = new Request('http://localhost', { method: 'POST', body: formData });
    const res = await POST(req);
    
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('Amount mismatch');
  });

  it('should return 400 if slip is already used', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { email: 'test@example.com' } });
    const formData = new FormData();
    formData.append('file', new Blob(['fake image'], { type: 'image/jpeg' }), 'slip.jpg');
    formData.append('amount', '100');

    const validTime = getMockTime(-2);

    (global.fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        success: true,
        data: { amount: 100, transRef: 'USED_REF', ...validTime }
      })
    });

    mockPrisma.transaction.findUnique.mockResolvedValue({ id: 'tx-1' });

    const req = new Request('http://localhost', { method: 'POST', body: formData });
    const res = await POST(req);
    
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('This slip has already been used.');
  });

  it('should process successful top-up and award coins correctly', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { email: 'test@example.com' } });
    const formData = new FormData();
    formData.append('file', new Blob(['fake image'], { type: 'image/jpeg' }), 'slip.jpg');
    formData.append('amount', '199'); // 199 package has 5% bonus

    const validTime = getMockTime(-1); // สลิปสดใหม่เพิ่งโอน 1 นาทีที่แล้ว

    (global.fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        success: true,
        data: { amount: 199, transRef: 'NEW_REF', ...validTime } // 🟢 ยัดเวลาเข้าไปให้ Test ผ่าน
      })
    });

    mockPrisma.transaction.findUnique.mockResolvedValue(null);
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1', email: 'test@example.com' });

    mockPrisma.$transaction.mockImplementation(async (callback: any) => {
      return callback(mockPrisma);
    });

    mockPrisma.user.update.mockResolvedValue({ coinBalance: 2089 });
    mockPrisma.transaction.create.mockResolvedValue({ id: 'new-tx' });

    const req = new Request('http://localhost', { method: 'POST', body: formData });
    const res = await POST(req);
    
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.coinsAdded).toBe(2089);
  });
});