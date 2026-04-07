import { OpType } from '@prisma/client';
import prisma from '../lib/prisma';

export const updateInventory = async (
  productId: string,
  warehouseId: string,
  quantityChange: number,
  opType: OpType,
  referenceId: string,
  userId: string,
  txClient: any = prisma
) => {
  const inventory = await txClient.inventory.upsert({
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

  await txClient.stockLedger.create({
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
};
