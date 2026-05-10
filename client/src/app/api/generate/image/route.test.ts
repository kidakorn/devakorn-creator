/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { POST } from './route';
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
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

// 3. Mock Google AI Middleman & Imagen
const mockRequest = jest.fn();
jest.mock('google-auth-library', () => {
	return {
		GoogleAuth: jest.fn().mockImplementation(() => ({
			getClient: jest.fn().mockResolvedValue({
				request: mockRequest // ใช้ตัวแปร mockRequest เพื่อคุมลำดับการตอบกลับ
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

describe('Unit Testing: Image Generation with Middleman', () => {

    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('Case 1: เหรียญไม่พอ (ต้องใช้ 39) ต้องคืนค่า 403', async () => {
		jest.mocked(getServerSession).mockResolvedValue({ user: { email: 'test@test.com' } } as any);
		jest.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user_1', coinBalance: 10, isBanned: false } as any);

		const formData = new FormData();
		formData.append('prompt', 'A cute cat');

		const req = new NextRequest('http://localhost/api/generate/image', { method: 'POST', body: formData });
		const res = await POST(req);
		const data = await res.json();

		expect(res.status).toBe(403);
		expect(data.message).toContain('Not enough coins');
	});

	it('Case 2: เจนผ่านสำเร็จ (หัก 39 เหรียญ และเซฟ Prompt 2 ภาษา)', async () => {
		jest.mocked(getServerSession).mockResolvedValue({ user: { email: 'test@test.com' } } as any);
		jest.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user_1', coinBalance: 100, isBanned: false } as any);
		
		// Mock การตอบกลับของ Gemini (แปลภาษา) และ Imagen (วาดรูป)
		mockRequest
			.mockResolvedValueOnce({ // ครั้งแรก: แปลภาษา
				data: { candidates: [{ content: { parts: [{ text: "A professional studio shot of a cat" }] } }] }
			})
			.mockResolvedValueOnce({ // ครั้งที่สอง: วาดรูป
				data: { predictions: [{ bytesBase64Encoded: 'fake_base64' }] }
			});

		jest.mocked(prisma.user.update).mockResolvedValue({ coinBalance: 61 } as any);

		const formData = new FormData();
		formData.append('prompt', 'แมวน่ารัก');

		const req = new NextRequest('http://localhost/api/generate/image', { method: 'POST', body: formData });
		const res = await POST(req);
		const data = await res.json();

		expect(res.status).toBe(200);
		// เช็คการหักเหรียญ 39
		expect(prisma.user.update).toHaveBeenCalledWith(
			expect.objectContaining({ data: { coinBalance: { decrement: 39 } } })
		);
		// เช็คการบันทึก Prompt 2 ภาษา
		expect(prisma.generatedAsset.create).toHaveBeenCalledWith(
			expect.objectContaining({ 
				data: expect.objectContaining({ 
					prompt: expect.stringContaining('[TH]: แมวน่ารัก') 
				}) 
			})
		);
	});

	it('Case 3: ถ้าเจอ Prompt 18+ (NSFW) ต้องแบนและไม่หักเหรียญ', async () => {
		jest.mocked(getServerSession).mockResolvedValue({ user: { email: 'test@test.com' } } as any);
		jest.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user_1', coinBalance: 100, isBanned: false } as any);

		// Mock ให้ Middleman ตอบว่าแบน
		mockRequest.mockResolvedValueOnce({
			data: { candidates: [{ content: { parts: [{ text: "REJECTED_NSFW" }] } }] }
		});

		const formData = new FormData();
		formData.append('prompt', 'รูปโป๊');

		const req = new NextRequest('http://localhost/api/generate/image', { method: 'POST', body: formData });
		const res = await POST(req);
		const data = await res.json();

		expect(res.status).toBe(400);
		expect(data.message).toContain('NSFW is strictly prohibited');
		expect(prisma.$transaction).not.toHaveBeenCalled(); // ห้ามหักเหรียญ
	});
});