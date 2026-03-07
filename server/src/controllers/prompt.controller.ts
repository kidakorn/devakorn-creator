import { Request, Response } from 'express';
import { GoogleAuth } from 'google-auth-library';

export const enhancePrompt = async (req: Request, res: Response): Promise<void> => {
	try {
		const { idea, category } = req.body;

		if (!idea) {
			res.status(400).json({ status: 'error', message: 'Please provide a core idea.' });
			return;
		}

		// 1. ใช้กุญแจชุดเดิมที่คุณใช้เจนรูปผ่าน (vertex-key.json)
		const auth = new GoogleAuth({
			scopes: ['https://www.googleapis.com/auth/cloud-platform'],
		});
		const client = await auth.getClient();

		const projectId = 'devakorn-creator-ai';
		const location = 'us-central1';

		// 🟢 เลือกใช้โมเดลล่าสุดที่คุณมีสิทธิ์ (อ้างอิงจากรูป Model Garden ของคุณ)
		const model = 'gemini-2.0-flash-001';

		// 2. ใช้ URL โครงสร้างเดียวกับ Imagen แต่เปลี่ยนเป็น :generateContent
		const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:generateContent`;

		const styleGuides: Record<string, string> = {
			'Photography': 'Hyper-realistic, 8k resolution, professional lighting, shallow depth of field, sharp focus.',
			'Cinematic': 'Epic movie aesthetic, dramatic shadows, anamorphic lens flares, high-budget film look.',
			'3D Render': 'Unreal Engine 5 style, ray tracing, Octane render, intricate 4k textures, volumetric lighting.',
			'Anime': 'Vibrant hand-drawn anime style, clean line art, expressive lighting, Studio Ghibli or Makoto Shinkai vibe.',
			'Cyberpunk': 'Neon-drenched cityscape, rainy night, high contrast, synthwave color palette, futuristic tech.',
			'Watercolor': 'Soft fluid brushstrokes, artistic color bleeding, visible paper texture, delicate hand-painted look.',
			'Minimalist': 'Simple forms, vast negative space, clean lines, elegant and serene composition.',
			'Pixel Art': 'Retro 16-bit game style, vibrant pixels, charming character designs, nostalgic atmosphere.',
			'Oil Painting': 'Rich impasto textures, visible thick brushwork, classical art style, deep and warm color tones.'
		};

		// 🟢 แก้ไข: ประกาศตัวแปรแค่ครั้งเดียวและรวมคำสั่งให้เข้มข้นขึ้น
		let styleInstruction = "";
		if (category && category !== 'Auto') {
			const specificStyle = styleGuides[category] || "";
			styleInstruction = `The output MUST strictly follow the "${category}" aesthetic. ${specificStyle} `;
		}

		const systemInstruction = `You are a professional Prompt Engineer. 
		Convert the user idea into a detailed English image prompt. 
		${styleInstruction}
		Include details on lighting, camera angle, and atmosphere.
		IMPORTANT: Output ONLY the final English prompt text. No conversational filler, no headers.`;

		// 3. ยิง Request แบบ REST (ท่าเดียวกับ generate.controller.ts)
		const response = await client.request({
			url: url,
			method: 'POST',
			data: {
				contents: [
					{
						role: 'user',
						parts: [{ text: idea }]
					}
				],
				systemInstruction: {
					parts: [{ text: systemInstruction }]
				},
				generationConfig: {
					temperature: 0.7,
					maxOutputTokens: 256
				}
			}
		});

		// 4. ดึงข้อความตอบกลับจากโครงสร้าง Gemini API
		const generatedText = (response.data as any).candidates[0].content.parts[0].text;

		res.status(200).json({
			status: 'success',
			prompt: generatedText.trim()
		});

	} catch (error: any) {
		// พิมพ์ Error ออกมาให้ละเอียดเหมือนในไฟล์เจนรูปของคุณ
		console.error("Error enhancing prompt:", JSON.stringify(error.response?.data || error.message, null, 2));
		res.status(500).json({ status: 'error', message: "AI is currently busy, please try again." });
	}
};