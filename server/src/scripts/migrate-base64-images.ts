import { prisma } from '../config/db.js';
import cloudinary from '../config/cloudinary.js';
import { DEFAULT_AVATAR_URL, isBase64Image } from '../utils/constants.js';
import {
  invalidateUsersCache,
  invalidatePostsCache,
} from '../config/cache.js';

async function migrateImages() {
  console.log('🚀 Starting image migration to Cloudinary...\n');

  let migratedAvatars = 0;
  let resetAvatars = 0;
  let migratedIdCards = 0;
  let resetIdCards = 0;
  let migratedDegrees = 0;
  let resetDegrees = 0;
  let migratedPosts = 0;
  let migratedEvents = 0;

  // 1. Process Users
  const users = await prisma.user.findMany();
  console.log(`Found ${users.length} user records to evaluate.`);

  for (const user of users) {
    const updateData: {
      avatarUrl?: string | null;
      idCardUrl?: string | null;
      degreeUrl?: string | null;
    } = {};

    // Check avatarUrl
    if (user.avatarUrl) {
      if (
        user.avatarUrl.startsWith('data:image/svg') ||
        user.avatarUrl.includes('<svg') ||
        user.avatarUrl.startsWith('data:image/svg+xml')
      ) {
        // Reset old SVG data URIs to default avatar URL
        updateData.avatarUrl = DEFAULT_AVATAR_URL;
        resetAvatars++;
        console.log(`[User ${user.id} - ${user.email}] Replaced SVG avatar with DEFAULT_AVATAR_URL`);
      } else if (isBase64Image(user.avatarUrl)) {
        try {
          console.log(`[User ${user.id} - ${user.email}] Uploading base64 avatar to Cloudinary...`);
          const uploadRes = await cloudinary.uploader.upload(user.avatarUrl, {
            folder: 'avatars',
          });
          updateData.avatarUrl = uploadRes.secure_url;
          migratedAvatars++;
          console.log(`[User ${user.id} - ${user.email}] Avatar uploaded successfully: ${uploadRes.secure_url}`);
        } catch (err) {
          console.error(`[User ${user.id} - ${user.email}] Failed to upload avatar to Cloudinary, resetting to default:`, err);
          updateData.avatarUrl = DEFAULT_AVATAR_URL;
          resetAvatars++;
        }
      }
    }

    // Check idCardUrl
    if (user.idCardUrl && isBase64Image(user.idCardUrl)) {
      try {
        console.log(`[User ${user.id} - ${user.email}] Uploading base64 ID card to Cloudinary...`);
        const uploadRes = await cloudinary.uploader.upload(user.idCardUrl, {
          folder: 'id_cards',
        });
        updateData.idCardUrl = uploadRes.secure_url;
        migratedIdCards++;
        console.log(`[User ${user.id} - ${user.email}] ID Card uploaded: ${uploadRes.secure_url}`);
      } catch (err) {
        console.error(`[User ${user.id} - ${user.email}] Failed to upload ID Card, resetting to null:`, err);
        updateData.idCardUrl = null;
        resetIdCards++;
      }
    }

    // Check degreeUrl
    if (user.degreeUrl && isBase64Image(user.degreeUrl)) {
      try {
        console.log(`[User ${user.id} - ${user.email}] Uploading base64 Degree Certificate to Cloudinary...`);
        const uploadRes = await cloudinary.uploader.upload(user.degreeUrl, {
          folder: 'degrees',
        });
        updateData.degreeUrl = uploadRes.secure_url;
        migratedDegrees++;
        console.log(`[User ${user.id} - ${user.email}] Degree Certificate uploaded: ${uploadRes.secure_url}`);
      } catch (err) {
        console.error(`[User ${user.id} - ${user.email}] Failed to upload Degree Certificate, resetting to null:`, err);
        updateData.degreeUrl = null;
        resetDegrees++;
      }
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });
    }
  }

  // 2. Process Posts
  const posts = await prisma.post.findMany();
  for (const post of posts) {
    if (post.imageUrl && isBase64Image(post.imageUrl)) {
      try {
        console.log(`[Post ${post.id}] Uploading base64 image to Cloudinary...`);
        const uploadRes = await cloudinary.uploader.upload(post.imageUrl, {
          folder: 'posts',
        });
        await prisma.post.update({
          where: { id: post.id },
          data: { imageUrl: uploadRes.secure_url },
        });
        migratedPosts++;
        console.log(`[Post ${post.id}] Post image uploaded: ${uploadRes.secure_url}`);
      } catch (err) {
        console.error(`[Post ${post.id}] Failed to upload image, removing base64:`, err);
        await prisma.post.update({
          where: { id: post.id },
          data: { imageUrl: null },
        });
      }
    }
  }

  // 3. Process Events
  const events = await prisma.event.findMany();
  for (const event of events) {
    if (event.imageUrl && isBase64Image(event.imageUrl)) {
      try {
        console.log(`[Event ${event.id}] Uploading base64 image to Cloudinary...`);
        const uploadRes = await cloudinary.uploader.upload(event.imageUrl, {
          folder: 'events',
        });
        await prisma.event.update({
          where: { id: event.id },
          data: { imageUrl: uploadRes.secure_url },
        });
        migratedEvents++;
        console.log(`[Event ${event.id}] Event image uploaded: ${uploadRes.secure_url}`);
      } catch (err) {
        console.error(`[Event ${event.id}] Failed to upload image, resetting to default:`, err);
      }
    }
  }

  // 4. Invalidate caches
  try {
    await Promise.all([invalidateUsersCache(), invalidatePostsCache()]);
    console.log('Cache invalidated successfully.');
  } catch (cErr) {
    console.warn('Cache invalidation warning:', cErr);
  }

  console.log('\n================ MIGRATION SUMMARY ================');
  console.log(`✅ Avatars uploaded to Cloudinary: ${migratedAvatars}`);
  console.log(`🔄 Avatars reset to default:       ${resetAvatars}`);
  console.log(`✅ ID Cards uploaded to Cloudinary: ${migratedIdCards}`);
  console.log(`🔄 ID Cards reset:                 ${resetIdCards}`);
  console.log(`✅ Degrees uploaded to Cloudinary:  ${migratedDegrees}`);
  console.log(`🔄 Degrees reset:                  ${resetDegrees}`);
  console.log(`✅ Posts migrated:                 ${migratedPosts}`);
  console.log(`✅ Events migrated:                ${migratedEvents}`);
  console.log('===================================================\n');
}

migrateImages()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('Migration failed:', err);
    await prisma.$disconnect();
    process.exit(1);
  });
