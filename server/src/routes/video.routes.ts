import express from 'express';
import { generateVideo } from '../controllers/video.controller';
const router = express.Router();

router.post('/generate', generateVideo);

export default router;