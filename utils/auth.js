require('dotenv')
const { User } = require('../models/index.model')
const { ERR } = require("./response")
const JWT = require('jsonwebtoken')
const { SECRET_KEY } = process.env

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) return ERR(res, 401, "Token required!")

    try {
        const decoded = JWT.verify(token, SECRET_KEY)

        const user = await User.findById(decoded.id)

        if (!user || user.token !== token) {
            return ERR(res, 403, "Invalid or logged out token!")
        }

        req.user = decoded
        next()
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            try {
                const decoded = JWT.verify(token, SECRET_KEY, { ignoreExpiration: true })
                await User.updateOne({ _id: decoded.id, token }, { $set: { token: null } })
            } catch (_) {

            }
            return ERR(res, 401, "Session expired, please login again")
        }
        return ERR(res, 403, "Invalid token!")
    }
}

module.exports = authMiddleware