/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { POST } from './route';
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { GoogleAuth } from 'google-auth-library';
import { v2 as cloudinary } from 'cloudinary';

// 1. Mock Database
jest.mock('@/lib/prisma', () => ({
	user: { findUnique: jest.fn(), update: jest.fn() },
	generatedAsset: { create: jest.fn() },
	transaction: { create: jest.fn() },
	$transaction: jest.fn(async (arg) => {
		if (Array.isArray(arg)) return Promise.all(arg);
		return arg(prisma);
	}),
}));

// 2. Mock Auth
jest.mock('next-auth', () => ({
	__esModule: true,
	default: jest.fn(),
	getServerSession: jest.fn(),
}));

jest.mock('next-auth/next', () => ({
	__esModule: true,
	default: jest.fn(),
}));

// 3. Mock Google AI
jest.mock('google-auth-library', () => {
	return {
		GoogleAuth: jest.fn().mockImplementation(() => ({
			getClient: jest.fn().mockResolvedValue({
				request: jest.fn().mockResolvedValue({
					data: { predictions: [{ bytesBase64Encoded: 'fake_base64_string' }] }
				})
			}),
			getProjectId: jest.fn().mockResolvedValue('test-project'),
		}))
	};
});

// 4. Mock Cloudinary
jest.mock('cloudinary', () => ({
	v2: {
		config: jest.fn(),
		uploader: {
			upload: jest.fn().mockResolvedValue({ secure_url: 'https://fake-cloudinary.com/image.png' })
		}
	}
}));

describe('Coin Deduction API: Image Generation (Phase 3)', () => {

	// Add this block
    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    // Add this block
    afterAll(() => {
        jest.restoreAllMocks();
    });

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('Case 1: Insufficient funds should return 403 error', async () => {
		// Arrange
		jest.mocked(getServerSession).mockResolvedValue({ user: { email: 'test@test.com' } } as any);
		jest.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user_1', coinBalance: 10, isBanned: false } as any);

		const formData = new FormData();
		formData.append('prompt', 'A cute cat');
		formData.append('quality', 'pro'); // ต้องการ 49 เหรียญ แต่มีแค่ 10

		// Act
		const req = new NextRequest('http://localhost/api/generate/image', { method: 'POST', body: formData });
		const res = await POST(req);
		const data = await res.json();

		// Assert
		expect(res.status).toBe(403);
		expect(data.message).toContain('Not enough coins');
		expect(prisma.$transaction).not.toHaveBeenCalled(); // ต้องไม่มีการหักเหรียญ
	});

	it('Case 2: Successful Fast Generation should deduct 29 coins', async () => {
		// Arrange
		jest.mocked(getServerSession).mockResolvedValue({ user: { email: 'test@test.com' } } as any);
		jest.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user_1', coinBalance: 100, isBanned: false } as any);

		// Mock ผลลัพธ์ของ Transaction
		jest.mocked(prisma.user.update).mockResolvedValue({ coinBalance: 71 } as any);
		jest.mocked(prisma.generatedAsset.create).mockResolvedValue({ outputUrl: 'https://fake.url' } as any);

		const formData = new FormData();
		formData.append('prompt', 'A fast cat');
		formData.append('quality', 'fast');

		// Act
		const req = new NextRequest('http://localhost/api/generate/image', { method: 'POST', body: formData });
		const res = await POST(req);
		const data = await res.json();

		// Assert
		expect(res.status).toBe(200);
		expect(data.usedModel).toBe('imagen-3.0-fast-generate-001');

		// เช็คว่าระบบสั่งหัก 29 เหรียญ
		expect(prisma.user.update).toHaveBeenCalledWith(
			expect.objectContaining({ data: { coinBalance: { decrement: 29 } } })
		);

		// เช็คว่าระบบบันทึก Transaction
		expect(prisma.transaction.create).toHaveBeenCalledWith(
			expect.objectContaining({ data: expect.objectContaining({ amount: -29, type: 'SPEND_IMAGE' }) })
		);
	});

	it('Case 3: Failure from External API (Google/Cloudinary) should not deduct coins', async () => {
		// Arrange
		jest.mocked(getServerSession).mockResolvedValue({ user: { email: 'test@test.com' } } as any);
		jest.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user_1', coinBalance: 100, isBanned: false } as any);

		// จำลองให้ Cloudinary อัปโหลดพัง
		jest.mocked(cloudinary.uploader.upload).mockRejectedValueOnce(new Error('Cloudinary Error'));

		const formData = new FormData();
		formData.append('prompt', 'A bug cat');

		// Act
		const req = new NextRequest('http://localhost/api/generate/image', { method: 'POST', body: formData });
		const res = await POST(req);
		const data = await res.json();

		// Assert
		expect(res.status).toBe(500); // ต้องร่วงลงมาที่ catch
		expect(prisma.$transaction).not.toHaveBeenCalled(); // สำคัญมาก: ต้องไม่มีการหักเหรียญ
	});
});