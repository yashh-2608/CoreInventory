import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const exportProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true, inventory: true },
    });

    let csv = 'Name,SKU,Category,UOM,Initial Stock,Total Inventory\n';
    products.forEach((p: any) => {
      const totalInventory = p.initialStock + p.inventory.reduce((acc: number, inv: any) => acc + inv.quantity, 0);
      csv += `"${p.name}","${p.sku}","${p.category.name}","${p.uom}",${p.initialStock},${totalInventory}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=products.csv');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ message: 'Error exporting products', error });
  }
};

export const exportLedger = async (req: Request, res: Response) => {
  try {
    const ledger = await prisma.stockLedger.findMany({
      include: { product: true, warehouse: true },
      orderBy: { createdAt: 'desc' },
    });

    let csv = 'Date,Product,Warehouse,Qty Change,Type,Reference ID\n';
    ledger.forEach((entry) => {
      csv += `"${entry.createdAt.toISOString()}","${entry.product.name}","${entry.warehouse.name}",${entry.qtyChange},"${entry.opType}","${entry.referenceId}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=inventory_ledger.csv');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ message: 'Error exporting ledger', error });
  }
};

export const exportGlobalReport = async (req: Request, res: Response) => {
  try {
    const warehouses = await prisma.warehouse.findMany({
      include: {
        inventory: {
          include: { product: { include: { category: true } } },
        },
      },
    });

    let csv = 'Warehouse,Product,SKU,Category,UOM,Quantity\n';
    warehouses.forEach((w: any) => {
      w.inventory.forEach((inv: any) => {
        csv += `"${w.name}","${inv.product.name}","${inv.product.sku}","${inv.product.category.name}","${inv.product.uom}",${inv.quantity}\n`;
      });
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=global_inventory_report.csv');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ message: 'Error exporting global report', error });
  }
};
