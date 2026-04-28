/* eslint-disable @typescript-eslint/no-explicit-any */
import { POST } from './route';
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';

// 1. Mock libraries
jest.mock('@/lib/prisma', () => ({
    like: {
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
    },
    generatedAsset: {
        findUnique: jest.fn(),
        update: jest.fn(),
    },
    user: {
		findUnique: jest.fn(),
        update: jest.fn(),
    },
    transaction: {
        create: jest.fn(),
    },
    // 🟢 อัปเกรด $transaction ให้รองรับทั้งแบบ Array และ Callback
    $transaction: jest.fn(async (arg) => {
        if (Array.isArray(arg)) {
            return Promise.all(arg); // รองรับการทำ Transaction แบบ Array
        }
        return arg(prisma); // รองรับการทำ Transaction แบบ Callback
    }),
}));

jest.mock('next-auth', () => ({
	__esModule: true,
	default: jest.fn(),
	getServerSession: jest.fn(),
}));

jest.mock('next-auth/next', () => ({
	__esModule: true,
	default: jest.fn(),
}));

describe('Social-to-Earn API: Like & Reward (Phase 2)', () => {

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('Case 1: User likes an asset for the first time -> Increases like count', async () => {
		// Arrange
		jest.mocked(getServerSession).mockResolvedValue({
			user: { id: 'user_A', name: 'Liker User' }
		} as any);

		// จำลองว่ายังไม่เคยกดไลก์รูปนี้
		jest.mocked(prisma.like.findUnique).mockResolvedValue(null as any);

		// จำลองข้อมูลรูปภาพ (ปัจจุบันมี 2 ไลก์ ยังไม่ถึงเป้าแจกรางวัล)
		jest.mocked(prisma.generatedAsset.findUnique).mockResolvedValue({
			id: 'asset_1',
			userId: 'creator_B',
			likeCount: 2
		} as any);

		jest.mocked(prisma.generatedAsset.update).mockResolvedValue({
            id: 'asset_1',
            likeCount: 3
        } as any);

		// Act
		// สมมติว่า Client ส่ง request body เป็น { assetId: 'asset_1' }
		const req = new NextRequest('http://localhost/api/social/like', {
			method: 'POST',
			body: JSON.stringify({ assetId: 'asset_1' })
		});
		const res = await POST(req);
		const data = await res.json();

		// Assert
		expect(res.status).toBe(200);
		expect(data.isLiked).toBe(true);

		// เช็คว่าระบบสั่งเพิ่ม Like ในตาราง Like และอัปเดตยอด likeCount ในตารางรูปภาพ
		expect(prisma.like.create).toHaveBeenCalled();
		expect(prisma.generatedAsset.update).toHaveBeenCalledWith(
			expect.objectContaining({
				data: { likeCount: { increment: 1 } }
			})
		);
		// ยังไม่ถึงเป้า (3 ไลก์) ต้องไม่มีการโอนเหรียญ
		expect(prisma.transaction.create).not.toHaveBeenCalled();
	});

	it('Case 2: Milestone hit (e.g., 5th like) -> Grants reward to creator', async () => {
        // Arrange
        jest.mocked(getServerSession).mockResolvedValue({
            user: { id: 'user_A', name: 'Liker User' }
        } as any);

        jest.mocked(prisma.like.findUnique).mockResolvedValue(null as any);

        // 1. จำลองว่ารูปภาพมี 4 ไลก์แล้ว
        jest.mocked(prisma.generatedAsset.findUnique).mockResolvedValue({
            id: 'asset_1',
            userId: 'creator_B',
            likeCount: 4
        } as any);

        // 2. 🟢 จำลองว่าอัปเดตเสร็จแล้วจะได้ 5 ไลก์ (เพื่อให้ผ่านด่าน REWARD_MILESTONE)
        jest.mocked(prisma.generatedAsset.update).mockResolvedValue({
            id: 'asset_1',
            likeCount: 5
        } as any);

        // 3. 🟢 จำลองข้อมูล Creator (เพื่อให้ผ่านด่าน if (creator))
        jest.mocked(prisma.user.findUnique).mockResolvedValue({
            id: 'creator_B',
            coinBalance: 0
        } as any);

        // Act
        const req = new NextRequest('http://localhost/api/social/like', { 
            method: 'POST',
            body: JSON.stringify({ assetId: 'asset_1' })
        });
        const res = await POST(req);

        // Assert
        expect(res.status).toBe(200);
        
        // เช็คว่ามีการโอน 1 เหรียญให้ creator_B จริง
        expect(prisma.user.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 'creator_B' },
                data: { coinBalance: { increment: 1 } }
            })
        );
    });

	it('Case 3: User unlikes the asset -> Decreases like count', async () => {
		// Arrange
		jest.mocked(getServerSession).mockResolvedValue({
			user: { id: 'user_A', name: 'Liker User' }
		} as any);

		// จำลองว่าเคยกดไลก์ไปแล้ว (มีข้อมูลในตาราง Like)
		jest.mocked(prisma.like.findUnique).mockResolvedValue({
			id: 'like_123',
			userId: 'user_A',
			assetId: 'asset_1'
		} as any);

		jest.mocked(prisma.user.findUnique).mockResolvedValue({
            id: 'creator_B',
            coinBalance: 0
        } as any);

		jest.mocked(prisma.generatedAsset.update).mockResolvedValue({
            id: 'asset_1',
            likeCount: 4
        } as any);

		// Act
		const req = new NextRequest('http://localhost/api/social/like', {
			method: 'POST',
			body: JSON.stringify({ assetId: 'asset_1' })
		});
		const res = await POST(req);
		const data = await res.json();

		// Assert
		expect(res.status).toBe(200);
		expect(data.isLiked).toBe(false);

		// ต้องสั่งลบข้อมูลออกจากตาราง Like และลดยอด likeCount
		expect(prisma.like.delete).toHaveBeenCalled();
		expect(prisma.generatedAsset.update).toHaveBeenCalledWith(
			expect.objectContaining({
				data: { likeCount: { decrement: 1 } }
			})
		);
	});

});