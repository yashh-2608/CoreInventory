import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/authMiddleware';

export const getWarehouses = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const warehouses = await prisma.warehouse.findMany({
      where: { userId },
      include: { inventory: { include: { product: true } } },
    });
    res.json(warehouses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching warehouses', error });
  }
};

export const createWarehouse = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, location, capacity } = req.body;
    const warehouse = await prisma.warehouse.create({
      data: { name, location, capacity, userId },
    });
    res.status(201).json(warehouse);
  } catch (error) {
    res.status(500).json({ message: 'Error creating warehouse', error });
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
    res.status(500).json({ message: 'Error updating warehouse', error });
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

    await prisma.warehouse.delete({ where: { id } });
    res.json({ message: 'Warehouse deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting warehouse', error });
  }
};
