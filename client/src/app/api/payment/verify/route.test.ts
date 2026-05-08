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

describe('POST /api/payment/verify', () => {
  let mockPrisma: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = new PrismaClient();
    process.env.THUNDER_API_KEY = 'valid-key';
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

  it('should return 400 if slip amount is less than expected', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { email: 'test@example.com' } });
    
    const formData = new FormData();
    formData.append('file', new Blob(['fake image'], { type: 'image/jpeg' }), 'slip.jpg');
    formData.append('amount', '500'); // User wants 500 package

    // Thunder API says it is only 100
    (global.fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        success: true,
        data: { amount: 100, transRef: 'REF123' }
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

    (global.fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        success: true,
        data: { amount: 100, transRef: 'USED_REF' }
      })
    });

    // Mock Prisma finding an existing transaction with this slipRef
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

    (global.fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        success: true,
        data: { amount: 199, transRef: 'NEW_REF' }
      })
    });

    // Validations pass
    mockPrisma.transaction.findUnique.mockResolvedValue(null);
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1', email: 'test@example.com' });

    // Mock Prisma transaction execution
    mockPrisma.$transaction.mockImplementation(async (callback: any) => {
      return callback(mockPrisma);
    });

    // 199 * 10 = 1990 base coins. 5% bonus = 99. Total = 2089
    mockPrisma.user.update.mockResolvedValue({ coinBalance: 2089 });
    mockPrisma.transaction.create.mockResolvedValue({ id: 'new-tx' });

    const req = new Request('http://localhost', { method: 'POST', body: formData });
    const res = await POST(req);
    
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.coinsAdded).toBe(2089);
    
    // Verify Prisma was called correctly
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { coinBalance: { increment: 2089 } }
    });
    
    expect(mockPrisma.transaction.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        type: 'TOPUP_SLIP',
        amount: 2089,
        slipRef: 'NEW_REF'
      })
    }));
  });
});
