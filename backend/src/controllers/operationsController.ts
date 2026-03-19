import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { updateInventory } from '../services/inventoryService';
import { OpType } from '@prisma/client';

// ─── RECEIPTS ───────────────────────────────────────────────────────────────

export const createReceipt = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { supplier, warehouseId, items, status } = req.body;

    // Verify warehouse belongs to this user
    const warehouse = await prisma.warehouse.findFirst({
      where: { id: warehouseId, userId },
      include: { inventory: { where: { userId } } },
    });
    if (!warehouse) return res.status(404).json({ message: 'Warehouse not found' });

    const totalIncoming = items.reduce((acc: number, item: any) => acc + item.quantity, 0);
    const currentStock = warehouse.inventory.reduce((acc, inv) => acc + inv.quantity, 0);

    if (currentStock + totalIncoming > warehouse.capacity) {
      return res.status(400).json({
        message: `Insufficient capacity. Warehouse capacity: ${warehouse.capacity}, Current: ${currentStock}, Incoming: ${totalIncoming}`,
      });
    }

    const receipt = await prisma.receipt.create({
      data: {
        supplier,
        warehouseId,
        userId,
        status: status || 'PENDING',
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

export const getReceiptDrafts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const drafts = await prisma.receipt.findMany({
      where: { status: 'DRAFT', userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(drafts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching receipt drafts', error });
  }
};

export const deleteReceipt = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const existing = await prisma.receipt.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ message: 'Receipt not found' });
    await prisma.receiptItem.deleteMany({ where: { receiptId: id } });
    await prisma.receipt.delete({ where: { id } });
    res.json({ message: 'Draft receipt deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting receipt', error });
  }
};

export const validateReceipt = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const receipt = await prisma.receipt.findFirst({
      where: { id, userId },
      include: { items: true },
    });

    if (!receipt || ((receipt.status as string) !== 'PENDING' && (receipt.status as string) !== 'DRAFT')) {
      return res.status(400).json({ message: 'Invalid receipt or already validated' });
    }

    await prisma.$transaction(async (tx) => {
      // Re-verify capacity during validation
      const warehouse = await tx.warehouse.findFirst({
        where: { id: receipt.warehouseId, userId },
        include: { inventory: { where: { userId } } },
      });
      const totalIncoming = receipt.items.reduce((acc, item) => acc + item.quantity, 0);
      const currentStock = (warehouse as any).inventory.reduce((acc: number, inv: any) => acc + inv.quantity, 0);

      if (currentStock + totalIncoming > (warehouse as any).capacity) {
        throw new Error(`Insufficient capacity in ${(warehouse as any).name}`);
      }

      for (const item of receipt.items) {
        await updateInventory(item.productId, receipt.warehouseId, item.quantity, OpType.RECEIPT, receipt.id, userId);
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

// ─── DELIVERIES ──────────────────────────────────────────────────────────────

export const createDelivery = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { customer, warehouseId, items, status } = req.body;

    // Verify warehouse belongs to this user
    const warehouse = await prisma.warehouse.findFirst({ where: { id: warehouseId, userId } });
    if (!warehouse) return res.status(404).json({ message: 'Warehouse not found' });

    // Check availability (scoped to this user's inventory)
    for (const item of items) {
      const inv = await prisma.inventory.findUnique({
        where: { productId_warehouseId_userId: { productId: item.productId, warehouseId, userId } },
      });
      if (!inv || inv.quantity < item.quantity) {
        const prod = await prisma.product.findFirst({ where: { id: item.productId, userId } });
        return res.status(400).json({
          message: `Insufficient stock for ${prod?.name || 'product'}. Available: ${inv?.quantity || 0}`,
        });
      }
    }

    const delivery = await prisma.delivery.create({
      data: {
        customer,
        warehouseId,
        userId,
        status: status || 'PENDING',
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

export const getDeliveryDrafts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const drafts = await prisma.delivery.findMany({
      where: { status: 'DRAFT', userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(drafts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching delivery drafts', error });
  }
};

export const deleteDelivery = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const existing = await prisma.delivery.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ message: 'Delivery not found' });
    await prisma.deliveryItem.deleteMany({ where: { deliveryId: id } });
    await prisma.delivery.delete({ where: { id } });
    res.json({ message: 'Draft delivery deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting delivery', error });
  }
};

export const confirmDelivery = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const delivery = await prisma.delivery.findFirst({
      where: { id, userId },
      include: { items: true },
    });

    if (!delivery || ((delivery.status as string) !== 'PENDING' && (delivery.status as string) !== 'DRAFT')) {
      return res.status(400).json({ message: 'Invalid delivery or already confirmed' });
    }

    await prisma.$transaction(async (tx) => {
      for (const item of delivery.items) {
        const inv = await tx.inventory.findUnique({
          where: { productId_warehouseId_userId: { productId: item.productId, warehouseId: delivery.warehouseId, userId } },
        });
        if (!inv || inv.quantity < item.quantity) {
          throw new Error(`Insufficient stock for one or more items during confirmation`);
        }
        await updateInventory(item.productId, delivery.warehouseId, -item.quantity, OpType.DELIVERY, delivery.id, userId);
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

// ─── TRANSFERS ───────────────────────────────────────────────────────────────

export const createTransfer = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { fromWarehouseId, toWarehouseId, items, status } = req.body;

    // Check availability at source (scoped to this user's inventory)
    for (const item of items) {
      const inv = await prisma.inventory.findUnique({
        where: { productId_warehouseId_userId: { productId: item.productId, warehouseId: fromWarehouseId, userId } },
      });
      if (!inv || inv.quantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock at source warehouse.` });
      }
    }

    // Check capacity at destination (scoped to this user's inventory)
    const destWarehouse = await prisma.warehouse.findFirst({
      where: { id: toWarehouseId, userId },
      include: { inventory: { where: { userId } } },
    });
    if (!destWarehouse) return res.status(404).json({ message: 'Destination warehouse not found' });

    const totalIncoming = items.reduce((acc: number, item: any) => acc + item.quantity, 0);
    const currentStock = destWarehouse.inventory.reduce((acc, inv) => acc + inv.quantity, 0);
    if (currentStock + totalIncoming > destWarehouse.capacity) {
      return res.status(400).json({ message: `Destination warehouse full. Capacity: ${destWarehouse.capacity}` });
    }

    const transfer = await prisma.transfer.create({
      data: {
        fromWarehouseId,
        toWarehouseId,
        userId,
        status: status || 'PENDING',
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

export const getTransferDrafts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const drafts = await prisma.transfer.findMany({
      where: { status: 'DRAFT', userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(drafts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transfer drafts', error });
  }
};

export const deleteTransfer = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const existing = await prisma.transfer.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ message: 'Transfer not found' });
    await prisma.transferItem.deleteMany({ where: { transferId: id } });
    await prisma.transfer.delete({ where: { id } });
    res.json({ message: 'Draft transfer deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting transfer', error });
  }
};

export const completeTransfer = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const transfer = await prisma.transfer.findFirst({
      where: { id, userId },
      include: { items: true },
    });

    if (!transfer || ((transfer.status as string) !== 'PENDING' && (transfer.status as string) !== 'DRAFT')) {
      return res.status(400).json({ message: 'Invalid transfer or already completed' });
    }

    await prisma.$transaction(async (tx) => {
      // Re-verify availability and capacity
      const destWarehouse = await tx.warehouse.findFirst({
        where: { id: transfer.toWarehouseId, userId },
        include: { inventory: { where: { userId } } },
      });
      const totalIncoming = transfer.items.reduce((acc, item) => acc + item.quantity, 0);
      const currentStock = (destWarehouse as any).inventory.reduce((acc: number, inv: any) => acc + inv.quantity, 0);
      if (currentStock + totalIncoming > (destWarehouse as any).capacity) {
        throw new Error(`Insufficient capacity in destination warehouse`);
      }

      for (const item of transfer.items) {
        const sourceInv = await tx.inventory.findUnique({
          where: { productId_warehouseId_userId: { productId: item.productId, warehouseId: transfer.fromWarehouseId, userId } },
        });
        if (!sourceInv || sourceInv.quantity < item.quantity) {
          throw new Error(`Insufficient stock at source during completion`);
        }

        // Out from source
        await updateInventory(item.productId, transfer.fromWarehouseId, -item.quantity, OpType.TRANSFER_OUT, transfer.id, userId);
        // In to destination
        await updateInventory(item.productId, transfer.toWarehouseId, item.quantity, OpType.TRANSFER_IN, transfer.id, userId);
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

// ─── ADJUSTMENTS ─────────────────────────────────────────────────────────────

export const createAdjustment = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { productId, warehouseId, recordedQty, countedQty, reason } = req.body;
    const diff = countedQty - recordedQty;

    // Check that resulting stock won't go below 0 (scoped to this user)
    const inv = await prisma.inventory.findUnique({
      where: { productId_warehouseId_userId: { productId, warehouseId, userId } },
    });
    const currentQty = inv?.quantity || 0;
    if (currentQty + diff < 0) {
      return res.status(400).json({
        message: `Adjustment would result in negative stock. Current: ${currentQty}, Adjustment: ${diff}`,
      });
    }

    // If adding stock, check warehouse capacity
    if (diff > 0) {
      const warehouse = await prisma.warehouse.findFirst({
        where: { id: warehouseId, userId },
        include: { inventory: { where: { userId } } },
      });
      if (warehouse) {
        const totalStock = warehouse.inventory.reduce((acc, i) => acc + i.quantity, 0);
        if (totalStock + diff > warehouse.capacity) {
          return res.status(400).json({
            message: `Adjustment would exceed warehouse capacity. Capacity: ${warehouse.capacity}, Current total: ${totalStock}, Adjustment: +${diff}`,
          });
        }
      }
    }

    await prisma.$transaction(async (tx) => {
      const adjustment = await tx.adjustment.create({
        data: { productId, warehouseId, userId, recordedQty, countedQty, reason },
      });
      await updateInventory(productId, warehouseId, diff, OpType.ADJUSTMENT, adjustment.id, userId);
    });

    res.status(201).json({ message: 'Adjustment recorded and stock updated' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating adjustment', error });
  }
};
