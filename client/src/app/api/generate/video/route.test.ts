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

jest.mock('next-auth/next', () => ({
	__esModule: true,
	default: jest.fn(),
}));

// 3. Mock Google GenAI (Veo)
const mockGenerateVideos = jest.fn();
const mockOperationsGet = jest.fn();

jest.mock('@google/genai', () => ({
	GoogleGenAI: jest.fn().mockImplementation(() => ({
		models: { generateVideos: mockGenerateVideos },
		operations: { get: mockOperationsGet }
	}))
}));

// 4. Mock Google Cloud Storage
jest.mock('@google-cloud/storage', () => ({
	Storage: jest.fn().mockImplementation(() => ({
		bucket: jest.fn().mockReturnThis(),
		file: jest.fn().mockReturnThis(),
		download: jest.fn().mockResolvedValue([Buffer.from('fake_video_buffer')])
	}))
}));

// 5. Mock Cloudinary
jest.mock('cloudinary', () => ({
	v2: {
		config: jest.fn(),
		uploader: {
			upload: jest.fn().mockResolvedValue({ secure_url: 'https://fake-cloudinary.com/video.mp4' })
		}
	}
}));

describe('Coin Deduction API: Video Generation (Phase 3)', () => {

	beforeAll(() => {
		// Suppress console.log and console.error to keep the test output clean
		jest.spyOn(console, 'log').mockImplementation(() => { });
		jest.spyOn(console, 'error').mockImplementation(() => { });
	});

	afterAll(() => {
		jest.restoreAllMocks();
	});

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('Case 1: Insufficient funds should return 403 error', async () => {
		// Arrange
		jest.mocked(getServerSession).mockResolvedValue({ user: { email: 'test@test.com' } } as any);

		// Mock user with only 500 coins (needs 799)
		jest.mocked(prisma.user.findUnique).mockResolvedValue({
			id: 'user_1',
			coinBalance: 500,
			isBanned: false
		} as any);

		const requestBody = { prompt: 'A cinematic car commercial', category: 'Product' };

		// Act
		const req = new NextRequest('http://localhost/api/generate/video', {
			method: 'POST',
			body: JSON.stringify(requestBody)
		});
		const res = await POST(req);
		const data = await res.json();

		// Assert
		expect(res.status).toBe(403);
		expect(data.message).toContain('Not enough coins');
		expect(prisma.$transaction).not.toHaveBeenCalled();
	});

	it('Case 2: Successful Video Generation should deduct 799 coins', async () => {
		// Arrange
		jest.mocked(getServerSession).mockResolvedValue({ user: { email: 'test@test.com' } } as any);

		// Mock user with 1000 coins
		jest.mocked(prisma.user.findUnique).mockResolvedValue({
			id: 'user_1',
			coinBalance: 1000,
			isBanned: false
		} as any);

		// Mock Veo API Response (Immediate completion)
		mockGenerateVideos.mockResolvedValue({
			name: 'operations/123',
			done: true,
			response: {
				generatedVideos: [{ video: { videoBytes: 'fake_base64_video' } }]
			}
		});

		jest.mocked(prisma.user.update).mockResolvedValue({ coinBalance: 201 } as any);
		jest.mocked(prisma.generatedAsset.create).mockResolvedValue({ outputUrl: 'https://fake.url' } as any);

		const requestBody = { prompt: 'A cinematic car commercial', category: 'Product' };

		// Act
		const req = new NextRequest('http://localhost/api/generate/video', {
			method: 'POST',
			body: JSON.stringify(requestBody)
		});
		const res = await POST(req);
		const data = await res.json();

		// Assert
		expect(res.status).toBe(200);
		expect(data.usedModel).toBe('veo-3.1-generate-001');

		// Verify exactly 799 coins were deducted
		expect(prisma.user.update).toHaveBeenCalledWith(
			expect.objectContaining({ data: { coinBalance: { decrement: 799 } } })
		);

		// Verify SPEND_VIDEO transaction was created
		expect(prisma.transaction.create).toHaveBeenCalledWith(
			expect.objectContaining({ data: expect.objectContaining({ amount: -799, type: 'SPEND_VIDEO' }) })
		);
	});

	it('Case 3: Failure from Veo AI should not deduct coins', async () => {
		// Arrange
		jest.mocked(getServerSession).mockResolvedValue({ user: { email: 'test@test.com' } } as any);
		jest.mocked(prisma.user.findUnique).mockResolvedValue({
			id: 'user_1',
			coinBalance: 1000,
			isBanned: false
		} as any);

		// Simulate Veo AI crash
		mockGenerateVideos.mockRejectedValueOnce(new Error('Veo API is busy'));

		const requestBody = { prompt: 'A cinematic car commercial' };

		// Act
		const req = new NextRequest('http://localhost/api/generate/video', {
			method: 'POST',
			body: JSON.stringify(requestBody)
		});
		const res = await POST(req);
		const data = await res.json();

		// Assert
		expect(res.status).toBe(500);
		expect(data.message).toContain('Failed to generate video');

		// Ensure no database transactions occurred
		expect(prisma.$transaction).not.toHaveBeenCalled();
	});
});