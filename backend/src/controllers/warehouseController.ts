import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getWarehouses = async (req: Request, res: Response) => {
  try {
    const warehouses = await prisma.warehouse.findMany({
      include: { inventory: { include: { product: true } } },
    });
    res.json(warehouses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching warehouses', error });
  }
};

export const createWarehouse = async (req: Request, res: Response) => {
  try {
    const { name, location, capacity } = req.body;
    const warehouse = await prisma.warehouse.create({
      data: { name, location, capacity },
    });
    res.status(201).json(warehouse);
  } catch (error) {
    res.status(500).json({ message: 'Error creating warehouse', error });
  }
};

export const updateWarehouse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const warehouse = await prisma.warehouse.update({
      where: { id },
      data,
    });
    res.json(warehouse);
  } catch (error) {
    res.status(500).json({ message: 'Error updating warehouse', error });
  }
};

export const deleteWarehouse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.warehouse.delete({ where: { id } });
    res.json({ message: 'Warehouse deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting warehouse', error });
  }
};
