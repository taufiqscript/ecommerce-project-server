const express = require('express')
const paymentController = require('../controllers/payment.controller')
const authMiddleware = require('../utils/auth')
const router = express.Router()

router.post('/create', authMiddleware, paymentController.createPayment)
router.post('/notification', paymentController.handleNotification)
router.get('/user/:userId', authMiddleware, paymentController.getUserTransaction)

module.exports = router