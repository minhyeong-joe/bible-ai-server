import express from 'express';
import cors from 'cors';
import corsConfig from './config/cors.js';
import dotenv from 'dotenv';
dotenv.config();
import aiRoutes from './routes/ai.js';
import { validateApiKey } from './middleware/auth.js';

const app = express();
app.use(cors(corsConfig));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.use('/api', validateApiKey, aiRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});