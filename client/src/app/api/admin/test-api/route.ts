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

		// ใช้ Path แบบ Absolute เพื่อให้หาไฟล์เจอแน่นอน
		const keyPath = path.resolve(process.cwd(), "vertex-key.json");
		
		const auth = new GoogleAuth({ 
			keyFile: keyPath, 
			scopes: ['https://www.googleapis.com/auth/cloud-platform'] 
		});

		const client = await auth.getClient();
		const projectId = await auth.getProjectId();

		// ทดสอบดึง Access Token เพื่อยืนยันว่า Key ใช้งานได้จริง
		await client.getAccessToken();

		return NextResponse.json({ 
			status: "success", 
			projectId: projectId,
			activeModels: [
				{ name: "Imagen 3.0 (Image)", status: "Active" },
				{ name: "Veo 3.1 (Video)", status: "Active" },
				{ name: "Gemini 2.0 (Prompt)", status: "Active" }
			]
		});

	} catch (error: any) {
		return NextResponse.json({ 
			status: "error", 
			message: `Connection Failed: ${error.message}` 
		}, { status: 500 });
	}
}