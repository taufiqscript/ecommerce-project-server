const midtransClient = require('midtrans-client')
const Transaction = require('../models/transaction.model')
const { ERR, OK } = require('../utils/response')

const snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY
})

const createPayment = async (req, res) => {
    try {
        const { userId, amount, customerName, email } = req.body


        if (!userId) return ERR(res, 400, 'User ID wajib dikirim!')

        const orderId = 'ORDER-' + Date.now()

        const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

        const parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: Math.round(Number(String(amount).replace(/[^0-9]/g, '')))
            },
            customer_details: {
                first_name: customerName,
                email
            },
            callbacks: {
                finish: `${FRONTEND_URL}/payment-success`
            }
        }

        await Transaction.create({
            user: userId,
            orderId,
            grossAmount: amount,
            transactionStatus: 'pending',
            paymentType: 'pending'
        })

        const transaction = await snap.createTransaction(parameter)

        return OK(res, 200, {
            token: transaction.token,
            redirect_url: transaction.redirect_url
        }, 'Success...')
    } catch (error) {
        console.error('Error createPayment:', error)
        return ERR(res, 500, error.message)
    }
}

const handleNotification = async (req, res) => {
    try {
        const notification = req.body
        const { order_id, transaction_status, payment_type, transaction_id } = notification 
        await Transaction.findOneAndUpdate(
            { orderId: order_id },
            {
                transactionStatus: transaction_status,
                paymentType: payment_type,
                transactionId: transaction_id 
            }, { new: true })

        return OK(res, 200, null, 'OK')
    }
    catch (error) {
        console.error('Error handleNotification:', error)
        return ERR(res, 500, error.message) 
    }
}

const getUserTransaction = async (req, res) => {
    try {
        const { userId } = req.params

        const transaction = await Transaction.find({ user: userId }).sort({ createdAt: -1 })

        return OK(res, 200, { transaction }, 'OK')
    } catch (error) {
        console.error('Error getUserTransaction:', error)
        return ERR(res, 500, error.message)
    }
}

module.exports = {
    createPayment,
    handleNotification,
    getUserTransaction
}