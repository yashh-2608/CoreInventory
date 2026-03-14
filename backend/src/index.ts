import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import warehouseRoutes from './routes/warehouseRoutes';
import operationsRoutes from './routes/operationsRoutes';
import reportRoutes from './routes/reportRoutes';
import exportRoutes from './routes/exportRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/operations', operationsRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/export', exportRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'CoreInventory API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
