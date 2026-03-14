import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true, inventory: { include: { warehouse: true } } },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, sku, categoryId, uom, initialStock } = req.body;
    const product = await prisma.product.create({
      data: { name, sku, categoryId, uom, initialStock: initialStock || 0 },
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const product = await prisma.product.update({
      where: { id },
      data,
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error });
  }
};
