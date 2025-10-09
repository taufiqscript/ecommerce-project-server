require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const routes = require('./routes/index.route')
const routesPayment = require('./routes/payment.route')
const passport = require('passport')

const { MONGO_URL } = process.env

const app = express()

app.use(express.json())
app.use(cors())
app.use(passport.initialize())


mongoose.connect(MONGO_URL).catch(err => {
    if (err) {
        console.log('tidak dapat terkoneksi ke database!')
        throw err
    } else {
        console.log('connecting to database...')
    }
})

app.use('/api', routes)
app.use('/api/payment', routesPayment)

// app.get('/', (req, res) => {
//     res.send('API Ecommerce Project is running...')
// })

app.listen(5000, () => {
    console.log("server berjalan di port " + 5000)
})

module.exports = app