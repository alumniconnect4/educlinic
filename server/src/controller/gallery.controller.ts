import type { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import cloudinary from '../config/cloudinary.js';

/** Helper: upload a base64 data URI to Cloudinary, return { url, publicId } */
const uploadBase64 = async (
  dataUri: string,
  folder: string
): Promise<{ url: string; publicId: string }> => {
  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: 'image',
  });
  return { url: result.secure_url, publicId: result.public_id };
};

const isBase64DataUri = (value: string) =>
  typeof value === 'string' && value.startsWith('data:image/');

// ─── Create Album ────────────────────────────────────────────────────────────
export const createAlbum = async (req: Request, res: Response) => {
  try {
    const { name, description, category, coverImageUrl } = req.body;

    if (!name?.trim() || !category?.trim()) {
      return res.status(400).json({ message: 'Album name and category are required' });
    }

    let finalCoverUrl: string | null = null;

    if (coverImageUrl) {
      if (isBase64DataUri(coverImageUrl)) {
        const { url } = await uploadBase64(coverImageUrl, 'educlinic/gallery/covers');
        finalCoverUrl = url;
      } else {
        finalCoverUrl = coverImageUrl;
      }
    }

    const album = await prisma.album.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        category: category.trim(),
        coverImageUrl: finalCoverUrl,
      },
      include: {
        _count: { select: { images: true } },
      },
    });

    return res.status(201).json({ message: 'Album created successfully', album });
  } catch (error) {
    console.error('createAlbum error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// ─── Get All Albums (Paginated + Search) ────────────────────────────────────
export const getAllAlbums = async (req: Request, res: Response) => {
  try {
    const limitParam = Array.isArray(req.params.limit) ? req.params.limit[0] : req.params.limit;
    const offsetParam = Array.isArray(req.params.offset) ? req.params.offset[0] : req.params.offset;

    const limit = parseInt(limitParam || '6') || 6;
    const offset = parseInt(offsetParam || '0') || 0;
    const search = (req.query.search as string)?.trim() || '';

    const where = search
      ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { category: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }
      : {};

    const [albums, total] = await Promise.all([
      prisma.album.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { images: true } },
        },
      }),
      prisma.album.count({ where }),
    ]);

    return res.status(200).json({ albums, total });
  } catch (error) {
    console.error('getAllAlbums error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// ─── Get Album By ID ─────────────────────────────────────────────────────────
export const getAlbumById = async (req: Request, res: Response) => {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(idParam || '');
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid album ID' });

    const album = await prisma.album.findUnique({
      where: { id },
      include: {
        images: { orderBy: { createdAt: 'asc' } },
        _count: { select: { images: true } },
      },
    });

    if (!album) return res.status(404).json({ message: 'Album not found' });

    return res.status(200).json({ album });
  } catch (error) {
    console.error('getAlbumById error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// ─── Delete Album ─────────────────────────────────────────────────────────────
export const deleteAlbum = async (req: Request, res: Response) => {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(idParam || '');
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid album ID' });

    const album = await prisma.album.findUnique({
      where: { id },
      include: { images: true },
    });
    if (!album) return res.status(404).json({ message: 'Album not found' });

    // Delete images from Cloudinary
    const deletePromises = album.images
      .filter((img) => img.publicId)
      .map((img) => cloudinary.uploader.destroy(img.publicId!));
    await Promise.allSettled(deletePromises);

    // Cascade deletes GalleryImage rows automatically
    await prisma.album.delete({ where: { id } });

    return res.status(200).json({ message: 'Album deleted successfully' });
  } catch (error) {
    console.error('deleteAlbum error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// ─── Add Single Image To Album (Real-time progress sync) ──────────────────────
export const addSingleImageToAlbum = async (req: Request, res: Response) => {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const albumId = parseInt(idParam || '');
    if (isNaN(albumId)) return res.status(400).json({ message: 'Invalid album ID' });

    const { image } = req.body as { image: string };
    if (!image) {
      return res.status(400).json({ message: 'Image data is required' });
    }

    const album = await prisma.album.findUnique({ where: { id: albumId } });
    if (!album) return res.status(404).json({ message: 'Album not found' });

    let url = image;
    let publicId: string | null = null;

    if (isBase64DataUri(image)) {
      const uploaded = await uploadBase64(image, `educlinic/gallery/albums/${albumId}`);
      url = uploaded.url;
      publicId = uploaded.publicId;
    }

    const galleryImage = await prisma.galleryImage.create({
      data: {
        albumId,
        imageUrl: url,
        publicId,
      },
    });

    await prisma.album.update({
      where: { id: albumId },
      data: { updatedAt: new Date() },
    });

    return res.status(201).json({ message: 'Image added successfully', image: galleryImage });
  } catch (error) {
    console.error('addSingleImageToAlbum error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// ─── Add Multiple Images To Album ─────────────────────────────────────────────
export const addImagesToAlbum = async (req: Request, res: Response) => {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const albumId = parseInt(idParam || '');
    if (isNaN(albumId)) return res.status(400).json({ message: 'Invalid album ID' });

    const { images } = req.body as { images: string[] };
    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }
    if (images.length > 10) {
      return res.status(400).json({ message: 'Maximum 10 images allowed per upload batch' });
    }

    const album = await prisma.album.findUnique({ where: { id: albumId } });
    if (!album) return res.status(404).json({ message: 'Album not found' });

    // Upload all images concurrently
    const uploadResults = await Promise.all(
      images.map(async (imgData) => {
        if (isBase64DataUri(imgData)) {
          return uploadBase64(imgData, `educlinic/gallery/albums/${albumId}`);
        }
        // plain URL — store as-is
        return { url: imgData, publicId: '' };
      })
    );

    const galleryImages = await prisma.$transaction(
      uploadResults.map(({ url, publicId }) =>
        prisma.galleryImage.create({
          data: {
            albumId,
            imageUrl: url,
            publicId: publicId || null,
          },
        })
      )
    );

    // Update album's updatedAt
    await prisma.album.update({
      where: { id: albumId },
      data: { updatedAt: new Date() },
    });

    return res.status(201).json({
      message: `${galleryImages.length} image(s) added successfully`,
      images: galleryImages,
    });
  } catch (error) {
    console.error('addImagesToAlbum error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// ─── Delete Single Image From Album ──────────────────────────────────────────
export const deleteImage = async (req: Request, res: Response) => {
  try {
    const idParam = Array.isArray(req.params.imageId) ? req.params.imageId[0] : req.params.imageId;
    const imageId = parseInt(idParam || '');
    if (isNaN(imageId)) return res.status(400).json({ message: 'Invalid image ID' });

    const image = await prisma.galleryImage.findUnique({ where: { id: imageId } });
    if (!image) return res.status(404).json({ message: 'Image not found' });

    if (image.publicId) {
      await cloudinary.uploader.destroy(image.publicId).catch((err) => console.error("Cloudinary delete error:", err));
    }

    await prisma.galleryImage.delete({ where: { id: imageId } });

    return res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('deleteImage error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// ─── Delete Bulk Images From Album ──────────────────────────────────────────
export const deleteBulkImages = async (req: Request, res: Response) => {
  try {
    const { imageIds } = req.body as { imageIds: number[] };
    if (!Array.isArray(imageIds) || imageIds.length === 0) {
      return res.status(400).json({ message: 'No image IDs provided' });
    }

    const images = await prisma.galleryImage.findMany({
      where: { id: { in: imageIds } },
    });

    const deleteCloudinaryPromises = images
      .filter((img) => img.publicId)
      .map((img) => cloudinary.uploader.destroy(img.publicId!).catch((err) => console.error("Cloudinary delete error:", err)));

    await Promise.allSettled(deleteCloudinaryPromises);

    await prisma.galleryImage.deleteMany({
      where: { id: { in: imageIds } },
    });

    return res.status(200).json({ message: `${images.length} image(s) deleted successfully` });
  } catch (error) {
    console.error('deleteBulkImages error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// ─── Update Album ─────────────────────────────────────────────────────────────
export const updateAlbum = async (req: Request, res: Response) => {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(idParam || '');
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid album ID' });

    const { name, description, category, coverImageUrl } = req.body;

    const existing = await prisma.album.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Album not found' });

    let finalCoverUrl = existing.coverImageUrl;

    if (coverImageUrl !== undefined && coverImageUrl !== existing.coverImageUrl) {
      if (isBase64DataUri(coverImageUrl)) {
        const { url } = await uploadBase64(coverImageUrl, 'educlinic/gallery/covers');
        finalCoverUrl = url;
      } else {
        finalCoverUrl = coverImageUrl || null;
      }
    }

    const updated = await prisma.album.update({
      where: { id },
      data: {
        name: name?.trim() || existing.name,
        description: description !== undefined ? (description?.trim() || null) : existing.description,
        category: category?.trim() || existing.category,
        coverImageUrl: finalCoverUrl,
      },
      include: { _count: { select: { images: true } } },
    });

    return res.status(200).json({ message: 'Album updated successfully', album: updated });
  } catch (error) {
    console.error('updateAlbum error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
