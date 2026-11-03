import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  getConversations,
  getMessagesWithUser,
  markMessagesAsRead,
  sendMessageHttp,
  editMessageHttp,
  deleteMessageHttp,
  clearChatHttp,
} from '../controller/chat.controller.js';

const router: Router = Router();

router.use(authMiddleware());

router.get('/conversations', getConversations);
router.get('/messages/:partnerId', getMessagesWithUser);
router.post('/read/:partnerId', markMessagesAsRead);
router.post('/send', sendMessageHttp);
router.put('/messages/:messageId', editMessageHttp);
router.delete('/messages/:messageId', deleteMessageHttp);
router.post('/clear/:partnerId', clearChatHttp);

export default router;
