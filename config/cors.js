import dotenv from 'dotenv';

dotenv.config();

export default {
    origin: process.env.UI_URL,
    methods: ['POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true
};