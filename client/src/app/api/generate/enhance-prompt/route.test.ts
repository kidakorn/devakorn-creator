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

describe('Coin Deduction API: Prompt Enhancement (Phase 3)', () => {

	beforeAll(() => {
		// Suppress console.error to keep the test output clean
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

		// Mock user with only 10 coins (needs 15)
		jest.mocked(prisma.user.findUnique).mockResolvedValue({
			id: 'user_1',
			coinBalance: 10,
			isBanned: false
		} as any);

		const requestBody = { idea: 'A futuristic city', category: 'Product Photography' };

		// Act
		const req = new NextRequest('http://localhost/api/enhance-prompt', {
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

	it('Case 2: Successful Prompt Enhancement should deduct 15 coins', async () => {
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
					content: { parts: [{ text: 'A highly detailed futuristic city...' }] }
				}]
			}
		});

		jest.mocked(prisma.user.update).mockResolvedValue({ coinBalance: 85 } as any);
		jest.mocked(prisma.generatedAsset.create).mockResolvedValue({ outputUrl: 'A highly detailed futuristic city...' } as any);

		const requestBody = { idea: 'A futuristic city', category: 'Product Photography' };

		// Act
		const req = new NextRequest('http://localhost/api/enhance-prompt', {
			method: 'POST',
			body: JSON.stringify(requestBody)
		});
		const res = await POST(req);
		const data = await res.json();

		// Assert
		expect(res.status).toBe(200);
		expect(data.usedModel).toBe('gemini-2.0-flash-001');

		// Verify exactly 15 coins were deducted
		expect(prisma.user.update).toHaveBeenCalledWith(
			expect.objectContaining({ data: { coinBalance: { decrement: 15 } } })
		);

		// Verify SPEND_PROMPT transaction was created
		expect(prisma.transaction.create).toHaveBeenCalledWith(
			expect.objectContaining({ data: expect.objectContaining({ amount: -15, type: 'SPEND_PROMPT' }) })
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

		const requestBody = { idea: 'A futuristic city' };

		// Act
		const req = new NextRequest('http://localhost/api/enhance-prompt', {
			method: 'POST',
			body: JSON.stringify(requestBody)
		});
		const res = await POST(req);
		const data = await res.json();

		// Assert
		expect(res.status).toBe(500);
		expect(data.message).toContain('Failed to enhance prompt');

		// Ensure no database transactions occurred
		expect(prisma.$transaction).not.toHaveBeenCalled();
	});
});