import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/authMiddleware';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { warehouseId, categoryId } = req.query;

    const totalProducts = await prisma.product.count({
      where: {
        userId,
        ...(categoryId && { categoryId: categoryId as string }),
        ...(warehouseId && { inventory: { some: { warehouseId: warehouseId as string, userId } } }),
      },
    });

    const lowStockItems = await prisma.inventory.count({
      where: {
        userId,
        quantity: { lt: 10 },
        ...(warehouseId && { warehouseId: warehouseId as string }),
        ...(categoryId && { product: { categoryId: categoryId as string } }),
      },
    });

    const pendingReceipts = await prisma.receipt.count({
      where: {
        userId,
        status: { in: ['PENDING', 'DRAFT'] },
        ...(warehouseId && { warehouseId: warehouseId as string }),
      },
    });

    const pendingDeliveries = await prisma.delivery.count({
      where: {
        userId,
        status: { in: ['PENDING', 'DRAFT'] },
        ...(warehouseId && { warehouseId: warehouseId as string }),
      },
    });

    const scheduledTransfers = await prisma.transfer.count({
      where: {
        userId,
        status: { in: ['PENDING', 'DRAFT'] },
        ...(warehouseId && {
          OR: [
            { fromWarehouseId: warehouseId as string },
            { toWarehouseId: warehouseId as string },
          ],
        }),
      },
    });

    const stockByWarehouse = await prisma.warehouse.findMany({
      where: {
        userId,
        ...(warehouseId && { id: warehouseId as string }),
      },
      include: {
        inventory: {
          where: {
            userId,
            ...(categoryId && { product: { categoryId: categoryId as string } }),
          },
          select: { quantity: true },
        },
      },
    });

    res.json({
      totalProducts,
      lowStockItems,
      pendingReceipts,
      pendingDeliveries,
      scheduledTransfers,
      stockByWarehouse: stockByWarehouse.map(w => ({
        name: w.name,
        value: w.inventory.reduce((acc, inv) => acc + inv.quantity, 0),
      })),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats', error });
  }
};

export const getInventoryActivity = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const activity = await prisma.stockLedger.findMany({
      where: { userId },
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: { product: true, warehouse: true },
    });
    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inventory activity', error });
  }
};

export const getCategoryDistribution = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const distribution = await prisma.category.findMany({
      where: { userId },
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

export const getLowStockItems = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const items = await prisma.inventory.findMany({
      where: { userId, quantity: { lt: 10 } },
      include: { product: true, warehouse: true },
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching low stock items', error });
  }
};

export const getPendingReceipts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const receipts = await prisma.receipt.findMany({
      where: { userId, status: { in: ['PENDING', 'DRAFT'] } },
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

export const getPendingDeliveries = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const deliveries = await prisma.delivery.findMany({
      where: { userId, status: { in: ['PENDING', 'DRAFT'] } },
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

export const getPendingTransfers = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const transfers = await prisma.transfer.findMany({
      where: { userId, status: { in: ['PENDING', 'DRAFT'] } },
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
