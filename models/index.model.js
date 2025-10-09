const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema({
    fullName: {
        required: true,
        type: String
    },
    phone: {
        required: true,
        type: String
    },
    province: {
        required: true,
        type: String
    },
    city: {
        required: true,
        type: String
    },
    district: {
        required: true,
        type: String
    },
    postalCode: {
        required: true,
        type: String
    },
    street: {
        required: true,
        type: String
    },
    detail: String,
    label: { type: String, enum: ["Rumah", "Kantor"], default: "" },
    isPrimary: { type: Boolean, default: true }
})

const userSchema = mongoose.Schema({
    email: {
        unique: true,
        required: true,
        type: String,
        match: [/^\S+@\S+\.\S+$/, 'Gunakan format email yang valid']
    },
    password: {
        required: false,
        type: String
    },
    token: {
        type: String,
        default: null
    },
    shoppingCart: Array,
    address: [addressSchema],
    checkOutProduk: {
        type: Array,
        default: []
    }
}, { timestamp: true })

module.exports = {
    User: mongoose.model("User", userSchema)
}