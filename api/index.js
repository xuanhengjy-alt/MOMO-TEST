// Vercel API入口文件 - 使用正确的Vercel API函数格式
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const db = require('../backend/config/database');
const testRoutes = require('../backend/routes/tests');
const resultRoutes = require('../backend/routes/results');

const app = express();

// 安全中间件
app.use(helmet());

// CORS 配置
app.use(cors({
  origin: function (origin, callback) {
    const allowList = ['http://localhost:8000', 'http://127.0.0.1:8000', 'https://momo-test-eszbrssfp-xuanhengs-projects-fae2322d.vercel.app'];
    if (!origin || allowList.includes(origin)) return callback(null, true);
    return callback(null, true);
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// 请求限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 15分钟内最多100个请求
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// 解析JSON
app.use(express.json({ limit: '10mb' }));

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API路由
app.use('/api/tests', testRoutes);
app.use('/api/results', resultRoutes);

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Vercel API函数格式
module.exports = (req, res) => {
  app(req, res);
};
