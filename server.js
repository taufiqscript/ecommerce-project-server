require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const routes = require('./routes/index.route')
const passport = require('passport')
const { MONGO_URL } = process.env

const app = express()

app.use(express.json())
app.use(cors())
app.use(passport.initialize())

const PORT = 5000


mongoose.connect(MONGO_URL).catch(err => {
    if (err) {
        console.log('tidak dapat terkoneksi ke database!')
        throw err
    } else {
        console.log('connecting to database...')
    }
})

app.use(routes)

app.listen(PORT, () => {
    console.log(`server berjalan di port ${PORT}`)
})