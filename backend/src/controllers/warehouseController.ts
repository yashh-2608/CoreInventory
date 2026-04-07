import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { sendServerError } from '../lib/errors';

export const getWarehouses = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const warehouses = await prisma.warehouse.findMany({
      where: { userId },
      include: { inventory: { include: { product: true } } },
    });
    res.json(warehouses);
  } catch (error) {
    sendServerError(res, error, 'Error fetching warehouses');
  }
};

export const createWarehouse = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, location, capacity } = req.body;

    if (!name || !location || !Number.isFinite(Number(capacity)) || Number(capacity) <= 0) {
      return res.status(400).json({ message: 'Name, location, and a valid positive capacity are required' });
    }

    const warehouse = await prisma.warehouse.create({
      data: { name, location, capacity: Number(capacity), userId },
    });
    res.status(201).json(warehouse);
  } catch (error) {
    sendServerError(res, error, 'Error creating warehouse');
  }
};

export const updateWarehouse = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const data = req.body;

    const existing = await prisma.warehouse.findFirst({ where: { id, userId } });
    if (!existing) {
      return res.status(404).json({ message: 'Warehouse not found' });
    }

    const warehouse = await prisma.warehouse.update({
      where: { id },
      data,
    });
    res.json(warehouse);
  } catch (error) {
    sendServerError(res, error, 'Error updating warehouse');
  }
};

export const deleteWarehouse = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existing = await prisma.warehouse.findFirst({ where: { id, userId } });
    if (!existing) {
      return res.status(404).json({ message: 'Warehouse not found' });
    }

    const linkedRecords = await Promise.all([
      prisma.inventory.count({ where: { warehouseId: id, userId } }),
      prisma.receipt.count({ where: { warehouseId: id, userId } }),
      prisma.delivery.count({ where: { warehouseId: id, userId } }),
      prisma.transfer.count({
        where: {
          userId,
          OR: [{ fromWarehouseId: id }, { toWarehouseId: id }],
        },
      }),
      prisma.adjustment.count({ where: { warehouseId: id, userId } }),
      prisma.stockLedger.count({ where: { warehouseId: id, userId } }),
    ]);

    if (linkedRecords.some(Boolean)) {
      return res.status(400).json({
        message: 'This warehouse already has inventory or operation history and cannot be deleted safely.',
      });
    }

    await prisma.warehouse.delete({ where: { id } });
    res.json({ message: 'Warehouse deleted' });
  } catch (error) {
    sendServerError(res, error, 'Error deleting warehouse');
  }
};
