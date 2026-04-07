import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { sendServerError } from '../lib/errors';

const getThreshold = (value: unknown) => {
  const parsed = Number(value ?? 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 10;
};

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { warehouseId, categoryId } = req.query;
    const lowStockThreshold = getThreshold(req.query.threshold);

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
        quantity: { lt: lowStockThreshold },
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
      stockByWarehouse: stockByWarehouse.map((warehouse) => ({
        name: warehouse.name,
        value: warehouse.inventory.reduce((acc, inventory) => acc + inventory.quantity, 0),
      })),
    });
  } catch (error) {
    sendServerError(res, error, 'Error fetching dashboard stats');
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
    sendServerError(res, error, 'Error fetching inventory activity');
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
    res.json(distribution.map((category: any) => ({ name: category.name, value: category._count.products })));
  } catch (error) {
    sendServerError(res, error, 'Error fetching category distribution');
  }
};

export const getLowStockItems = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const lowStockThreshold = getThreshold(req.query.threshold);

    const items = await prisma.inventory.findMany({
      where: { userId, quantity: { lt: lowStockThreshold } },
      include: { product: true, warehouse: true },
    });
    res.json(items);
  } catch (error) {
    sendServerError(res, error, 'Error fetching low stock items');
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
    sendServerError(res, error, 'Error fetching pending receipts');
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
    sendServerError(res, error, 'Error fetching pending deliveries');
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
    sendServerError(res, error, 'Error fetching pending transfers');
  }
};
