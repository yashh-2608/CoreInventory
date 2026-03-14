import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { updateInventory } from '../services/inventoryService';
import { OpType } from '@prisma/client';

export const createReceipt = async (req: Request, res: Response) => {
  try {
    const { supplier, warehouseId, items } = req.body;
    const receipt = await prisma.receipt.create({
      data: {
        supplier,
        warehouseId,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    });
    res.status(201).json(receipt);
  } catch (error) {
    res.status(500).json({ message: 'Error creating receipt', error });
  }
};

export const validateReceipt = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const receipt = await prisma.receipt.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!receipt || receipt.status !== 'PENDING') {
      return res.status(400).json({ message: 'Invalid receipt or already validated' });
    }

    await prisma.$transaction(async (tx) => {
      for (const item of receipt.items) {
        await updateInventory(item.productId, receipt.warehouseId, item.quantity, OpType.RECEIPT, receipt.id);
      }
      await tx.receipt.update({
        where: { id },
        data: { status: 'COMPLETED', validatedAt: new Date() },
      });
    });

    res.json({ message: 'Receipt validated and stock updated' });
  } catch (error) {
    res.status(500).json({ message: 'Error validating receipt', error });
  }
};

export const createDelivery = async (req: Request, res: Response) => {
  try {
    const { customer, warehouseId, items } = req.body;
    const delivery = await prisma.delivery.create({
      data: {
        customer,
        warehouseId,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    });
    res.status(201).json(delivery);
  } catch (error) {
    res.status(500).json({ message: 'Error creating delivery', error });
  }
};

export const confirmDelivery = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const delivery = await prisma.delivery.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!delivery || delivery.status !== 'PENDING') {
      return res.status(400).json({ message: 'Invalid delivery or already confirmed' });
    }

    await prisma.$transaction(async (tx) => {
      for (const item of delivery.items) {
        await updateInventory(item.productId, delivery.warehouseId, -item.quantity, OpType.DELIVERY, delivery.id);
      }
      await tx.delivery.update({
        where: { id },
        data: { status: 'COMPLETED', confirmedAt: new Date() },
      });
    });

    res.json({ message: 'Delivery confirmed and stock updated' });
  } catch (error) {
    res.status(500).json({ message: 'Error confirming delivery', error });
  }
};

export const createTransfer = async (req: Request, res: Response) => {
  try {
    const { fromWarehouseId, toWarehouseId, items } = req.body;
    const transfer = await prisma.transfer.create({
      data: {
        fromWarehouseId,
        toWarehouseId,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    });
    res.status(201).json(transfer);
  } catch (error) {
    res.status(500).json({ message: 'Error creating transfer', error });
  }
};

export const completeTransfer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const transfer = await prisma.transfer.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!transfer || transfer.status !== 'PENDING') {
      return res.status(400).json({ message: 'Invalid transfer or already completed' });
    }

    await prisma.$transaction(async (tx) => {
      for (const item of transfer.items) {
        // Out from source
        await updateInventory(item.productId, transfer.fromWarehouseId, -item.quantity, OpType.TRANSFER_OUT, transfer.id);
        // In to destination
        await updateInventory(item.productId, transfer.toWarehouseId, item.quantity, OpType.TRANSFER_IN, transfer.id);
      }
      await tx.transfer.update({
        where: { id },
        data: { status: 'COMPLETED', completedAt: new Date() },
      });
    });

    res.json({ message: 'Transfer completed and stock updated' });
  } catch (error) {
    res.status(500).json({ message: 'Error completing transfer', error });
  }
};

export const createAdjustment = async (req: Request, res: Response) => {
  try {
    const { productId, warehouseId, recordedQty, countedQty, reason } = req.body;
    const diff = countedQty - recordedQty;

    await prisma.$transaction(async (tx) => {
      const adjustment = await tx.adjustment.create({
        data: { productId, warehouseId, recordedQty, countedQty, reason },
      });
      await updateInventory(productId, warehouseId, diff, OpType.ADJUSTMENT, adjustment.id);
    });

    res.status(201).json({ message: 'Adjustment recorded and stock updated' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating adjustment', error });
  }
};
