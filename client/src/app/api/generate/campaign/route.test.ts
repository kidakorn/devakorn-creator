/* eslint-disable @typescript-eslint/no-explicit-any */
import { POST } from './route';
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';

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

// 3. Mock Google Auth Library (Vertex AI)
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

// 4. Mock global fetch for downloading image
global.fetch = jest.fn(() =>
	Promise.resolve({
		arrayBuffer: () => Promise.resolve(Buffer.from('fake_image_data')),
		headers: {
			get: () => 'image/jpeg'
		}
	})
) as jest.Mock;

describe('Coin Deduction API: Campaign Generation (Phase 3)', () => {

	beforeAll(() => {
		// Suppress console.log and console.error
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

		// Mock user with only 20 coins (needs 39)
		jest.mocked(prisma.user.findUnique).mockResolvedValue({
			id: 'user_1',
			coinBalance: 20,
			isBanned: false
		} as any);

		const requestBody = { imageUrl: 'https://fake.url/image.jpg', platform: 'Facebook' };

		// Act
		const req = new NextRequest('http://localhost/api/campaign', {
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

	it('Case 2: Successful Campaign Generation should deduct 39 coins', async () => {
		// Arrange
		jest.mocked(getServerSession).mockResolvedValue({ user: { email: 'test@test.com' } } as any);

		// Mock user with 100 coins
		jest.mocked(prisma.user.findUnique).mockResolvedValue({
			id: 'user_1',
			coinBalance: 100,
			isBanned: false
		} as any);

		// Mock Vertex AI Response
		mockRequest.mockResolvedValue({
			data: {
				candidates: [{
					content: { parts: [{ text: 'Here is your highly engaging campaign...' }] }
				}]
			}
		});

		jest.mocked(prisma.user.update).mockResolvedValue({ coinBalance: 61 } as any);
		jest.mocked(prisma.generatedAsset.create).mockResolvedValue({ outputUrl: 'https://fake.url/image.jpg' } as any);

		const requestBody = { imageUrl: 'https://fake.url/image.jpg', platform: 'Facebook' };

		// Act
		const req = new NextRequest('http://localhost/api/campaign', {
			method: 'POST',
			body: JSON.stringify(requestBody)
		});
		const res = await POST(req);

		// Assert
		expect(res.status).toBe(200);

		// Verify exactly 39 coins were deducted
		expect(prisma.user.update).toHaveBeenCalledWith(
			expect.objectContaining({ data: { coinBalance: { decrement: 39 } } })
		);

		// Verify SPEND_CAMPAIGN transaction was created
		expect(prisma.transaction.create).toHaveBeenCalledWith(
			expect.objectContaining({ data: expect.objectContaining({ amount: -39, type: 'SPEND_CAMPAIGN' }) })
		);
	});

	it('Case 3: Failure from Vertex AI should not deduct coins', async () => {
		// Arrange
		jest.mocked(getServerSession).mockResolvedValue({ user: { email: 'test@test.com' } } as any);
		jest.mocked(prisma.user.findUnique).mockResolvedValue({
			id: 'user_1',
			coinBalance: 100,
			isBanned: false
		} as any);

		// Simulate Vertex AI crash
		mockRequest.mockRejectedValueOnce(new Error('Vertex AI Error'));

		const requestBody = { imageUrl: 'https://fake.url/image.jpg' };

		// Act
		const req = new NextRequest('http://localhost/api/campaign', {
			method: 'POST',
			body: JSON.stringify(requestBody)
		});
		const res = await POST(req);
		const data = await res.json();

		// Assert
		expect(res.status).toBe(500);
		expect(data.message).toContain('Failed to generate campaign');

		// Ensure no database transactions occurred
		expect(prisma.$transaction).not.toHaveBeenCalled();
	});
});