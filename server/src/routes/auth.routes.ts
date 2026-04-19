import { login, logout, register } from '../controller/auth.controller.js';
import express from 'express';

const router: express.Router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);

export default router;
