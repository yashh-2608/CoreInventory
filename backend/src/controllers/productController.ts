import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/authMiddleware';

export const getProducts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const products = await prisma.product.findMany({
      where: { userId },
      include: { category: true, inventory: { include: { warehouse: true } } },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error });
  }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, sku, categoryId, categoryName, uom, initialStock } = req.body;

    let resolvedCategoryId = categoryId;

    // If the client sends a categoryName instead of an existing categoryId,
    // auto-create a per-user category (or find the existing one).
    if (!resolvedCategoryId && categoryName) {
      const category = await prisma.category.upsert({
        where: { name_userId: { name: categoryName, userId } },
        update: {},
        create: { name: categoryName, userId },
      });
      resolvedCategoryId = category.id;
    }

    // Verify the category belongs to this user
    if (resolvedCategoryId) {
      const cat = await prisma.category.findFirst({
        where: { id: resolvedCategoryId, userId },
      });
      if (!cat) {
        return res.status(400).json({ message: 'Category not found for this user' });
      }
    }

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        categoryId: resolvedCategoryId,
        uom,
        initialStock: initialStock || 0,
        userId,
      },
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const data = req.body;

    // Ensure this product belongs to the requesting user
    const existing = await prisma.product.findFirst({ where: { id, userId } });
    if (!existing) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = await prisma.product.update({
      where: { id },
      data,
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    // Ensure this product belongs to the requesting user
    const existing = await prisma.product.findFirst({ where: { id, userId } });
    if (!existing) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Cascade delete: remove dependent records first to avoid FK constraint errors
    await prisma.stockLedger.deleteMany({ where: { productId: id, userId } });
    await prisma.receiptItem.deleteMany({ where: { productId: id } });
    await prisma.deliveryItem.deleteMany({ where: { productId: id } });
    await prisma.transferItem.deleteMany({ where: { productId: id } });
    await prisma.adjustment.deleteMany({ where: { productId: id, userId } });
    await prisma.inventory.deleteMany({ where: { productId: id, userId } });
    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Product and all related records deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error });
  }
};

export const getCategories = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const categories = await prisma.category.findMany({ where: { userId } });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error });
  }
};

export const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    const category = await prisma.category.upsert({
      where: { name_userId: { name, userId } },
      update: {},
      create: { name, userId },
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error });
  }
};
