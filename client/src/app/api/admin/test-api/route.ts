/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { GoogleAuth } from "google-auth-library";
import path from "path";

export async function GET() {
	try {
		const session = await getServerSession(authOptions);
		if (!session || (session.user as any)?.role !== "ADMIN") {
			return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 403 });
		}

		// 1. ค้นหาไฟล์ Key แบบ Absolute Path
		const keyPath = path.resolve(process.cwd(), "vertex-key.json");
		
		const auth = new GoogleAuth({ 
			keyFile: keyPath, 
			scopes: ['https://www.googleapis.com/auth/cloud-platform'] 
		});

		const client = await auth.getClient();
		const projectId = await auth.getProjectId();

		if (!projectId) {
			throw new Error("Cannot find Project ID in vertex-key.json");
		}

		// 2. ทดสอบขอ Access Token (ถ้าได้แปลว่าไฟล์สมบูรณ์และเชื่อมต่อติด 100%)
		await client.getAccessToken();

		// 3. ส่งข้อมูลจำลอง Catalog โมเดลที่ระบบเรารองรับ เพื่อป้องกัน Error 404 จาก Google
		const modelsCatalog = [
			{ id: "imagen-3.0-generate-001", name: "Imagen 3.0 Generate", type: "Image", status: "Active" },
			{ id: "veo-3.1-generate-001", name: "Veo 3.1 Video", type: "Video", status: "Active" },
			{ id: "gemini-2.0-flash-001", name: "Gemini 2.0 Flash", type: "Prompt", status: "Active" },
			{ id: "imagen-3.0-fast", name: "Imagen 3.0 Fast", type: "Image", status: "Standby" },
			{ id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", type: "Prompt", status: "Standby" },
			{ id: "text-embedding-004", name: "Vertex Embeddings", type: "Other", status: "Standby" }
		];

		return NextResponse.json({ 
			status: "success", 
			projectId: projectId,
			models: modelsCatalog
		});

	} catch (error: any) {
		return NextResponse.json({ 
			status: "error", 
			message: `Connection Failed: ${error.message}` 
		}, { status: 500 });
	}
}