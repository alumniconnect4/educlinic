import type { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import cloudinary from '../config/cloudinary.js';

export const addGalleryItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawItems = Array.isArray(req.body.items) ? req.body.items : [req.body];

    if (rawItems.length === 0) {
      res.status(400).json({ message: 'No items provided' });
      return;
    }

    // Validate all items
    for (const item of rawItems) {
      if (!item.imageUrl || !item.category) {
        res.status(400).json({ message: 'imageUrl and category are required for all items' });
        return;
      }
    }

    const createdItems = [];

    for (const item of rawItems) {
      const { imageUrl, category, description } = item;
      const finalDescription = description && description.trim() !== '' ? description : category;

      let finalImageUrl = imageUrl;
      let finalPublicId: string | null = null;

      if (imageUrl && imageUrl.startsWith('data:image')) {
        try {
          const cloudinaryUpload = await cloudinary.uploader.upload(imageUrl, {
            folder: 'gallery',
          });
          finalImageUrl = cloudinaryUpload.secure_url;
          finalPublicId = cloudinaryUpload.public_id;
        } catch (error) {
          console.warn('Cloudinary upload failed, falling back to base64 URL storage:', error);
          finalImageUrl = imageUrl;
          finalPublicId = null;
        }
      }

      const newItem = await prisma.galleryItem.create({
        data: {
          url: finalImageUrl,
          publicId: finalPublicId,
          category,
          description: finalDescription,
        },
      });
      createdItems.push(newItem);
    }

    res.status(201).json({
      message: `${createdItems.length} Gallery item(s) created successfully`,
      items: createdItems,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getGalleryItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, limit, page } = req.query;
    const parsedLimit = limit ? parseInt(limit as string) : undefined;
    const parsedPage = page ? parseInt(page as string) : 1;
    const skip = parsedLimit ? (parsedPage - 1) * parsedLimit : undefined;

    const where: any = {};
    if (category && category !== 'ALL') {
      where.category = category as string;
    }

    const queryOptions: any = {
      where,
      orderBy: { createdAt: 'desc' },
    };
    if (parsedLimit !== undefined) {
      queryOptions.take = parsedLimit;
    }
    if (skip !== undefined) {
      queryOptions.skip = skip;
    }

    const [items, total] = await Promise.all([
      prisma.galleryItem.findMany(queryOptions),
      prisma.galleryItem.count({ where }),
    ]);

    // Extract unique categories for filtering helper
    const allCategories = await prisma.galleryItem.findMany({
      select: { category: true },
      distinct: ['category'],
    });
    const categories = allCategories.map((c: { category: string }) => c.category);

    res.status(200).json({
      items,
      total,
      page: parsedPage,
      totalPages: parsedLimit ? Math.ceil(total / parsedLimit) : 1,
      categories,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const deleteGalleryItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid Gallery Item ID' });
      return;
    }

    const item = await prisma.galleryItem.findUnique({
      where: { id },
    });

    if (!item) {
      res.status(404).json({ message: 'Gallery item not found' });
      return;
    }

    if (item.publicId) {
      try {
        await cloudinary.uploader.destroy(item.publicId);
      } catch (err) {
        console.error('Failed to delete image from Cloudinary:', err);
      }
    }

    await prisma.galleryItem.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Gallery item deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
