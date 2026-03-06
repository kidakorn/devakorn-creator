import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import generateRoutes from './routes/generate.routes';

// โหลดตัวแปรสภาพแวดล้อม
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middlewares ---
app.use(cors({
	origin: 'http://localhost:3000',
	credentials: true,
}));
app.use(express.json());

// --- Routes ---
// Health Check
app.get('/api/health', (req: Request, res: Response) => {
	res.status(200).json({ status: 'success', message: 'API is running! 🚀' });
});

// นำ Routes ที่เราแยกไฟล์ไว้มาใช้งาน โดยมี Prefix นำหน้าว่า /api/generate
app.use('/api/generate', generateRoutes);

// --- Start Server ---
app.listen(PORT, () => {
	console.log(`✅ Server is running on http://localhost:${PORT}`);
});