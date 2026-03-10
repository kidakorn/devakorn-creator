import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import generateRoutes from './routes/generate.routes';
import videoRoutes from './routes/video.routes'; // 🟢 คุณ Import มารอไว้แล้ว!

// โหลดตัวแปรสภาพแวดล้อม
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middlewares ---
app.use(cors({
	origin: 'http://localhost:3000',
	credentials: true,
}));
app.use(express.json({ limit: '50mb' }));

// --- Routes ---
// Health Check
app.get('/api/health', (req: Request, res: Response) => {
	res.status(200).json({ status: 'success', message: 'API is running! 🚀' });
});

app.use('/api/generate', generateRoutes);

// 🟢 เพิ่มบรรทัดนี้เข้าไปครับ
app.use('/api/video', videoRoutes);

// --- Start Server ---
app.listen(PORT, () => {
	console.log(`✅ Server is running on http://localhost:${PORT}`);
});