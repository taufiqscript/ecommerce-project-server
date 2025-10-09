const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderId: { type: String, required: true, unique: true },
    grossAmount: { type: Number, required: true },
    paymentType: { type: String, default: 'pending' },
    transactionStatus: { type: String, default: 'pending' },
    transactionId: { type: String },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true })

module.exports = mongoose.model('Transaction', transactionSchema)