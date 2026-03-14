import { OpType } from '@prisma/client';
import prisma from '../lib/prisma';

export const updateInventory = async (
  productId: string,
  warehouseId: string,
  quantityChange: number,
  opType: OpType,
  referenceId: string
) => {
  return await prisma.$transaction(async (tx: any) => {
    // 1. Update or create Inventory entry
    const inventory = await tx.inventory.upsert({
      where: {
        productId_warehouseId: { productId, warehouseId },
      },
      update: {
        quantity: { increment: quantityChange },
      },
      create: {
        productId,
        warehouseId,
        quantity: quantityChange,
      },
    });

    // 2. Create StockLedger entry
    await tx.stockLedger.create({
      data: {
        productId,
        warehouseId,
        qtyChange: quantityChange,
        opType,
        referenceId,
      },
    });

    return inventory;
  });
};
