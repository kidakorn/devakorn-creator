/* eslint-disable @typescript-eslint/no-explicit-any */
import { POST } from './route';
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';

// 1. Mock libraries to prevent actual database interactions
jest.mock('@/lib/prisma', () => ({
    user: {
        findUnique: jest.fn(),
        update: jest.fn(),
    },
    transaction: {
        create: jest.fn(),
    },
    $transaction: jest.fn(async (callback) => {
        return callback(prisma);
    }),
}));

// Update the next-auth mock to include the default export and next-auth/next
jest.mock('next-auth', () => ({
    __esModule: true,
    default: jest.fn(),
    getServerSession: jest.fn(),
}));

jest.mock('next-auth/next', () => ({
    __esModule: true,
    default: jest.fn(),
}));

describe('Daily Check-in API (Phase 1)', () => {

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('Case 1: First time check-in should grant 5 Coins and set streak to 1', async () => {
		// Arrange
		jest.mocked(getServerSession).mockResolvedValue({
			user: { id: 'user_123', name: 'Test User' }
		} as any);

		jest.mocked(prisma.user.findUnique).mockResolvedValue({
			id: 'user_123',
			checkInStreak: 0,
			lastCheckIn: null,
			coinBalance: 0
		} as any);

		jest.mocked(prisma.user.update).mockResolvedValue({
			coinBalance: 5
		} as any);

		// Act
		const req = new NextRequest('http://localhost/api/user/checkin', { method: 'POST' });
		const res = await POST(req);
		const data = await res.json();

		// Assert
		expect(res.status).toBe(200);
		expect(data.status).toBe('success');
		expect(data.streak).toBe(1);
		expect(data.newBalance).toBe(5);
		expect(prisma.transaction.create).toHaveBeenCalledTimes(1);
	});

	it('Case 2: Double claiming on the same day should return 400 error', async () => {
		// Arrange
		jest.mocked(getServerSession).mockResolvedValue({
			user: { id: 'user_123', name: 'Test User' }
		} as any);

		const today = new Date();
		jest.mocked(prisma.user.findUnique).mockResolvedValue({
			id: 'user_123',
			checkInStreak: 1,
			lastCheckIn: today,
			coinBalance: 5
		} as any);

		// Act
		const req = new NextRequest('http://localhost/api/user/checkin', { method: 'POST' });
		const res = await POST(req);
		const data = await res.json();

		// Assert
		expect(res.status).toBe(400);
		expect(data.status).toBe('error');
		expect(data.message).toBe('You already claimed your reward today. Come back tomorrow!');

		expect(prisma.user.update).not.toHaveBeenCalled();
		expect(prisma.transaction.create).not.toHaveBeenCalled();
	});

	it('Case 3: Consecutive check-in on the second day should grant 10 Coins and set streak to 2', async () => {
		// Arrange
		jest.mocked(getServerSession).mockResolvedValue({
			user: { id: 'user_123', name: 'Test User' }
		} as any);

		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);

		jest.mocked(prisma.user.findUnique).mockResolvedValue({
			id: 'user_123',
			checkInStreak: 1,
			lastCheckIn: yesterday,
			coinBalance: 5
		} as any);

		jest.mocked(prisma.user.update).mockResolvedValue({
			coinBalance: 15
		} as any);

		// Act
		const req = new NextRequest('http://localhost/api/user/checkin', { method: 'POST' });
		const res = await POST(req);
		const data = await res.json();

		// Assert
		expect(res.status).toBe(200);
		expect(data.status).toBe('success');
		expect(data.streak).toBe(2);
		expect(data.newBalance).toBe(15);
		expect(prisma.transaction.create).toHaveBeenCalledTimes(1);
	});
});