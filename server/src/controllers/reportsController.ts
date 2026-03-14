import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalProducts = await prisma.product.count();
    const lowStockItems = await prisma.inventory.count({
      where: { quantity: { lt: 10 } }, // Arbitrary low stock threshold
    });
    const pendingReceipts = await prisma.receipt.count({ where: { status: 'PENDING' } });
    const pendingDeliveries = await prisma.delivery.count({ where: { status: 'PENDING' } });
    const scheduledTransfers = await prisma.transfer.count({ where: { status: 'PENDING' } });

    const stockByWarehouse = await prisma.warehouse.findMany({
      include: {
        inventory: {
          select: { quantity: true }
        }
      }
    });

    res.json({
      totalProducts,
      lowStockItems,
      pendingReceipts,
      pendingDeliveries,
      scheduledTransfers,
      stockByWarehouse: stockByWarehouse.map(w => ({
        name: w.name,
        value: w.inventory.reduce((acc, inv) => acc + inv.quantity, 0)
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats', error });
  }
};

export const getInventoryActivity = async (req: Request, res: Response) => {
  try {
    const activity = await prisma.stockLedger.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: { product: true, warehouse: true },
    });
    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inventory activity', error });
  }
};

export const getCategoryDistribution = async (req: Request, res: Response) => {
  try {
    const distribution = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
    res.json(distribution.map((c: any) => ({ name: c.name, value: c._count.products })));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching category distribution', error });
  }
};

export const getLowStockItems = async (req: Request, res: Response) => {
  try {
    const items = await prisma.inventory.findMany({
      where: { quantity: { lt: 10 } },
      include: { product: true, warehouse: true },
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching low stock items', error });
  }
};

export const getPendingReceipts = async (req: Request, res: Response) => {
  try {
    const receipts = await prisma.receipt.findMany({
      where: { status: 'PENDING' },
      include: {
        warehouse: true,
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(receipts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending receipts', error });
  }
};

export const getPendingDeliveries = async (req: Request, res: Response) => {
  try {
    const deliveries = await prisma.delivery.findMany({
      where: { status: 'PENDING' },
      include: {
        warehouse: true,
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending deliveries', error });
  }
};

export const getPendingTransfers = async (req: Request, res: Response) => {
  try {
    const transfers = await prisma.transfer.findMany({
      where: { status: 'PENDING' },
      include: {
        fromWarehouse: true,
        toWarehouse: true,
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(transfers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending transfers', error });
  }
};
