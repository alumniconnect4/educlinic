import type { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import cloudinary from '../config/cloudinary.js';
import {
  getCache,
  setCache,
  generatePostListCacheKey,
  generatePostDetailCacheKey,
  generatePostCommentsCacheKey,
  invalidatePostsCache,
} from '../config/cache.js';

export const createPost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { title, content, imageUrl, tags } = req.body;
    if (!title || !content) {
      res.status(400).json({ message: 'Title and content are required' });
      return;
    }

    let finalContent = content;
    if (tags && Array.isArray(tags) && tags.length > 0) {
      const tagString = tags
        .map(
          (t: string) =>
            `<span class="text-[#3b49df] bg-[#3b49df]/10 px-2 py-0.5 rounded font-mono font-medium">#${t}</span>`
        )
        .join(' ');
      finalContent = `${content}\n\n<div class="mt-4 flex gap-2">${tagString}</div>`;
    }

    let finalImageUrl = imageUrl;
    if (imageUrl && imageUrl.startsWith('data:image')) {
      try {
        const cloudinaryUpload = await cloudinary.uploader.upload(imageUrl, {
          folder: 'posts',
        });
        finalImageUrl = cloudinaryUpload.secure_url;
      } catch (error) {
        console.error('Cloudinary upload error:', error);
        res.status(500).json({ message: 'Image upload failed', error });
        return;
      }
    }

    const post = await prisma.post.create({
      data: {
        title,
        content: finalContent,
        imageUrl: finalImageUrl,
        createdById: userId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            role: true,
            bio: true,
            avatarUrl: true,
            createdAt: true,
          },
        },
      },
    });

    await invalidatePostsCache();

    res.status(201).json({ ...post, comments: [], isLiked: false });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllPosts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const page = parseInt((req.query.page as string) || '1');
    const limit = parseInt((req.query.limit as string) || '20');
    const skip = (page - 1) * limit;
    const authorId = req.query.authorId
      ? parseInt(req.query.authorId as string)
      : undefined;
    const tag = req.query.tag as string | undefined;
    const search = req.query.search as string | undefined;
    const sortBy = req.query.sortBy as string | undefined;

    const cacheKey = generatePostListCacheKey(
      userId,
      page,
      limit,
      authorId,
      tag,
      search,
      sortBy
    );
    const cachedData = await getCache<any>(cacheKey);
    if (cachedData) {
      res.status(200).json(cachedData);
      return;
    }

    const AND: any[] = [];
    if (authorId) AND.push({ createdById: authorId });
    if (tag)
      AND.push({ content: { contains: `#${tag}`, mode: 'insensitive' } });
    if (search) {
      AND.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    const whereClause = AND.length > 0 ? { AND } : {};

    let orderByClause: any = { createdAt: 'desc' };
    if (sortBy === 'likes') {
      orderByClause = {
        likes: {
          _count: 'desc',
        },
      };
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: whereClause,
        orderBy: orderByClause,
        skip,
        take: limit,
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              role: true,
              bio: true,
              avatarUrl: true,
              createdAt: true,
            },
          },
          _count: {
            select: { comments: true, likes: true },
          },
          ...(userId && {
            likes: {
              where: { userId },
            },
          }),
        },
      }),
      prisma.post.count({ where: whereClause }),
    ]);

    const formattedPosts = posts.map((post) => ({
      ...post,
      isLiked: userId ? post.likes && post.likes.length > 0 : false,
      likes: undefined,
      comments: [],
    }));

    const responsePayload = {
      posts: formattedPosts,
      page,
      limit,
      total,
      hasMore: skip + posts.length < total,
    };
    await setCache(cacheKey, responsePayload, 300);

    res.status(200).json(responsePayload);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPostById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!id) {
      res.status(400).json({ message: 'Post ID is required' });
      return;
    }

    const cacheKey = generatePostDetailCacheKey(userId, id);
    const cachedData = await getCache<any>(cacheKey);
    if (cachedData) {
      res.status(200).json(cachedData);
      return;
    }

    const post = await prisma.post.findUnique({
      where: { id: parseInt(id as string) },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            role: true,
            bio: true,
            avatarUrl: true,
            createdAt: true,
          },
        },
        _count: {
          select: { likes: true },
        },
        ...(userId && {
          likes: {
            where: { userId },
          },
        }),
      },
    });

    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    const formattedPost = {
      ...post,
      isLiked: userId ? post.likes && post.likes.length > 0 : false,
      likes: undefined,
      comments: [],
    };

    await setCache(cacheKey, formattedPost, 300);

    res.status(200).json(formattedPost);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const togglePostLike = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!id) {
      res.status(400).json({ message: 'Post ID is required' });
      return;
    }

    const postId = parseInt(id as string);

    const existingLike = await prisma.postLike.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existingLike) {
      await prisma.postLike.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });
      await invalidatePostsCache();
      res.status(200).json({ message: 'Post unliked' });
    } else {
      await prisma.postLike.create({
        data: {
          userId,
          postId,
        },
      });
      await invalidatePostsCache();
      res.status(201).json({ message: 'Post liked' });
    }
  } catch (error) {
    console.error('Error toggling post like:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { content, parentId } = req.body;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!id || !content) {
      res.status(400).json({ message: 'Post ID and content are required' });
      return;
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        postId: parseInt(id as string),
        authorId: userId,
        parentId: parentId ? parseInt(parentId as string) : null,
      },
      include: {
        author: {
          select: { id: true, name: true },
        },
      },
    });

    await invalidatePostsCache();

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPostComments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const page = parseInt((req.query.page as string) || '1');
    const limit = parseInt((req.query.limit as string) || '5');
    const skip = (page - 1) * limit;
    const userId = req.user?.id;

    if (!id) {
      res.status(400).json({ message: 'Post ID is required' });
      return;
    }

    const cacheKey = generatePostCommentsCacheKey(id, page, limit);
    const cachedData = await getCache<any>(cacheKey);
    if (cachedData) {
      res.status(200).json(cachedData);
      return;
    }

    const postId = parseInt(id as string);

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { postId, parentId: null },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
        include: {
          author: { select: { id: true, name: true } },
          _count: { select: { likes: true, replies: true } },
          ...(userId && {
            likes: { where: { userId } },
          }),
        },
      }),
      prisma.comment.count({
        where: { postId, parentId: null },
      }),
    ]);

    const formattedComments = comments.map((c) => ({
      ...c,
      isLiked: userId ? c.likes && c.likes.length > 0 : false,
      likes: undefined,
      replyCount: c._count.replies,
    }));

    const responsePayload = {
      comments: formattedComments,
      page,
      limit,
      total,
      hasMore: skip + comments.length < total,
    };
    await setCache(cacheKey, responsePayload, 300);

    res.status(200).json(responsePayload);
  } catch (error) {
    console.error('Error fetching post comments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getCommentReplies = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { commentId } = req.params;
    const page = parseInt((req.query.page as string) || '1');
    const limit = parseInt((req.query.limit as string) || '5');
    const skip = (page - 1) * limit;
    const userId = req.user?.id;

    if (!commentId) {
      res.status(400).json({ message: 'Comment ID is required' });
      return;
    }

    const parentId = parseInt(commentId as string);

    const [replies, total] = await Promise.all([
      prisma.comment.findMany({
        where: { parentId },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
        include: {
          author: { select: { id: true, name: true } },
          _count: { select: { likes: true, replies: true } },
          ...(userId && {
            likes: { where: { userId } },
          }),
        },
      }),
      prisma.comment.count({
        where: { parentId },
      }),
    ]);

    const formattedReplies = replies.map((r) => ({
      ...r,
      isLiked: userId ? r.likes && r.likes.length > 0 : false,
      likes: undefined,
      replyCount: r._count.replies,
    }));

    res.status(200).json({
      replies: formattedReplies,
      page,
      limit,
      total,
      hasMore: skip + replies.length < total,
    });
  } catch (error) {
    console.error('Error fetching comment replies:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const toggleCommentLike = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { commentId } = req.params;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!commentId) {
      res.status(400).json({ message: 'Comment ID is required' });
      return;
    }

    const parsedCommentId = parseInt(commentId as string);

    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId: parsedCommentId,
        },
      },
    });

    if (existingLike) {
      await prisma.commentLike.delete({
        where: {
          userId_commentId: {
            userId,
            commentId: parsedCommentId,
          },
        },
      });
      await invalidatePostsCache();
      res.status(200).json({ message: 'Comment unliked' });
    } else {
      await prisma.commentLike.create({
        data: {
          userId,
          commentId: parsedCommentId,
        },
      });
      await invalidatePostsCache();
      res.status(201).json({ message: 'Comment liked' });
    }
  } catch (error) {
    console.error('Error toggling comment like:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const uploadImage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { image } = req.body;
    if (!image) {
      res.status(400).json({ message: 'Image data is required' });
      return;
    }

    const cloudinaryUpload = await cloudinary.uploader.upload(image, {
      folder: 'editor_images',
    });

    res.status(200).json({ url: cloudinaryUpload.secure_url });
  } catch (error) {
    console.error('Cloudinary image upload error:', error);
    res.status(500).json({ message: 'Image upload failed', error });
  }
};

export const deleteComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { commentId } = req.params;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!commentId) {
      res.status(400).json({ message: 'Comment ID is required' });
      return;
    }

    const parsedCommentId = parseInt(commentId as string);

    const comment = await prisma.comment.findUnique({
      where: { id: parsedCommentId },
      include: { post: { select: { createdById: true } } },
    });

    if (!comment) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }

    if (comment.authorId !== userId && comment.post.createdById !== userId) {
      res
        .status(403)
        .json({ message: 'You do not have permission to delete this comment' });
      return;
    }

    await prisma.comment.delete({
      where: { id: parsedCommentId },
    });

    await invalidatePostsCache();

    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deletePost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!id) {
      res.status(400).json({ message: 'Post ID is required' });
      return;
    }

    const parsedPostId = parseInt(id as string);

    const post = await prisma.post.findUnique({
      where: { id: parsedPostId },
    });

    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    if (post.createdById !== userId) {
      res
        .status(403)
        .json({ message: 'You do not have permission to delete this post' });
      return;
    }

    await prisma.post.delete({
      where: { id: parsedPostId },
    });

    await invalidatePostsCache();

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
