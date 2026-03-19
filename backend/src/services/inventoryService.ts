import { OpType } from '@prisma/client';
import prisma from '../lib/prisma';

export const updateInventory = async (
  productId: string,
  warehouseId: string,
  quantityChange: number,
  opType: OpType,
  referenceId: string,
  userId: string
) => {
  return await prisma.$transaction(async (tx: any) => {
    // 1. Update or create Inventory entry (scoped to this user)
    const inventory = await tx.inventory.upsert({
      where: {
        productId_warehouseId_userId: { productId, warehouseId, userId },
      },
      update: {
        quantity: { increment: quantityChange },
      },
      create: {
        productId,
        warehouseId,
        userId,
        quantity: quantityChange,
      },
    });

    // 2. Create StockLedger entry (scoped to this user)
    await tx.stockLedger.create({
      data: {
        productId,
        warehouseId,
        userId,
        qtyChange: quantityChange,
        opType,
        referenceId,
      },
    });

    return inventory;
  });
};
