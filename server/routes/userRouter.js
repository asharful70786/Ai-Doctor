import express from 'express';
const router = express.Router();

import { sendOtpToEmail, registerUser, loginWithPassword, sendOtpLogin, verifyOtpLogin, authCheck, logoutUser } from '../controllers/userController.js';


router.post('/send-otp', sendOtpToEmail);
router.post('/register', registerUser);
router.post('/login', loginWithPassword);
router.post('/otp-login', sendOtpLogin);
router.post('/verify-otp-login', verifyOtpLogin);
router.get('/auth-check', authCheck);
router.get('/logout', logoutUser);

export default router;
