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

// 3. Mock Google AI Middleman (แปลภาษา)
const mockRequest = jest.fn();
jest.mock('google-auth-library', () => {
	return {
		GoogleAuth: jest.fn().mockImplementation(() => ({
			getClient: jest.fn().mockResolvedValue({
				request: mockRequest
			}),
			getProjectId: jest.fn().mockResolvedValue('test-project'),
		}))
	};
});

// 4. Mock Google GenAI (Veo)
const mockGenerateVideos = jest.fn();
const mockOperationsGet = jest.fn();
jest.mock('@google/genai', () => ({
	GoogleGenAI: jest.fn().mockImplementation(() => ({
		models: { generateVideos: mockGenerateVideos },
		operations: { get: mockOperationsGet }
	}))
}));

// 5. Mock Google Cloud Storage
jest.mock('@google-cloud/storage', () => ({
	Storage: jest.fn().mockImplementation(() => ({
		bucket: jest.fn().mockReturnThis(),
		file: jest.fn().mockReturnThis(),
		download: jest.fn().mockResolvedValue([Buffer.from('fake_video_buffer')])
	}))
}));

// 6. Mock Cloudinary
jest.mock('cloudinary', () => ({
	v2: {
		config: jest.fn(),
		uploader: {
			upload: jest.fn().mockResolvedValue({ secure_url: 'https://fake-cloudinary.com/video.mp4' })
		}
	}
}));

describe('Unit Testing: Video Generation with Middleman', () => {

	beforeAll(() => {
		jest.spyOn(console, 'log').mockImplementation(() => { });
		jest.spyOn(console, 'error').mockImplementation(() => { });
	});

	afterAll(() => {
		jest.restoreAllMocks();
	});

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('Case 1: เหรียญไม่พอ (ต้องใช้ 499) ต้องคืนค่า 403', async () => {
		jest.mocked(getServerSession).mockResolvedValue({ user: { email: 'test@test.com' } } as any);
		jest.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user_1', coinBalance: 200, isBanned: false } as any);

		const formData = new FormData();
		formData.append('prompt', 'A cinematic video');

		const req = new NextRequest('http://localhost/api/generate/video', { method: 'POST', body: formData });
		const res = await POST(req);
		const data = await res.json();

		expect(res.status).toBe(403);
		expect(data.message).toContain('เหรียญไม่เพียงพอ');
	});

	it('Case 2: เจนวิดีโอสำเร็จ (หัก 499 เหรียญ และเซฟ Prompt 2 ภาษา)', async () => {
		jest.mocked(getServerSession).mockResolvedValue({ user: { email: 'test@test.com' } } as any);
		jest.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user_1', coinBalance: 1000, isBanned: false } as any);

		// Mock Gemini แปลภาษา
		mockRequest.mockResolvedValueOnce({
			data: { candidates: [{ content: { parts: [{ text: "Cinematic commercial of a product" }] } }] }
		});

		// Mock Veo เจนวิดีโอ
		mockGenerateVideos.mockResolvedValue({
			name: 'operations/123',
			done: true,
			response: { generatedVideos: [{ video: { videoBytes: 'fake_base64_video' } }] }
		});

		jest.mocked(prisma.user.update).mockResolvedValue({ coinBalance: 501 } as any);

		const formData = new FormData();
		formData.append('prompt', 'วิดีโอสบู่');

		const req = new NextRequest('http://localhost/api/generate/video', { method: 'POST', body: formData });
		const res = await POST(req);
		const data = await res.json();

		expect(res.status).toBe(200);
		// เช็คการหักเหรียญ 499
		expect(prisma.user.update).toHaveBeenCalledWith(
			expect.objectContaining({ data: { coinBalance: { decrement: 499 } } })
		);
		// เช็คการบันทึก Prompt 2 ภาษา
		expect(prisma.generatedAsset.create).toHaveBeenCalledWith(
			expect.objectContaining({ 
				data: expect.objectContaining({ 
					prompt: expect.stringContaining('[TH]: วิดีโอสบู่') 
				}) 
			})
		);
	});

	it('Case 3: ถ้าเจอเนื้อหาไม่เหมาะสม (NSFW) ต้องแบนทันที', async () => {
		jest.mocked(getServerSession).mockResolvedValue({ user: { email: 'test@test.com' } } as any);
		jest.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user_1', coinBalance: 1000, isBanned: false } as any);

		// Mock ให้ Middleman ตอบว่าแบน
		mockRequest.mockResolvedValueOnce({
			data: { candidates: [{ content: { parts: [{ text: "REJECTED_NSFW" }] } }] }
		});

		const formData = new FormData();
		formData.append('prompt', 'เนื้อหา 18+');

		const req = new NextRequest('http://localhost/api/generate/video', { method: 'POST', body: formData });
		const res = await POST(req);
		const data = await res.json();

		expect(res.status).toBe(400);
		expect(data.message).toContain('NSFW is strictly prohibited');
		expect(mockGenerateVideos).not.toHaveBeenCalled(); // ห้ามยิงไปหา AI วิดีโอ
	});
});