const route = require('express').Router()
const userController = require('../controllers/index.controller')
const authMiddleware = require('../utils/auth')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const jwt = require('jsonwebtoken')
const { User } = require('../models/index.model')

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:5000/auth/google/callback"
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ googleId: profile.id })
                if (!user) {
                    user = await User.create({
                        googleId: profile.id,
                        email: profile.emails[0].value,
                        name: profile.displayName
                    })
                }
                return done(null, user)
            } catch (error) {
                return done(error, null)
            }
        }
    )
)

route.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

route.get(
    '/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        const token = jwt.sign({ id: req.user._id }, process.env.SECRET_KEY, { expiresIn: '12h' })
        res.redirect(`http://localhost:5173/login?token=${token}`)
    }
)

route.post('/google-login', userController.googleLogin)

route.post('/sign-up', userController.signUpUser)
route.post('/sign-in', userController.signInUser)
route.delete('/sign-out', authMiddleware, userController.signOutUser)

//Shopping Cart
route.get('/cart/:email/:token', authMiddleware, userController.getMyShoppingCart)
route.post('/cart', authMiddleware, userController.addToShoppingCart)
route.delete('/cart', authMiddleware, userController.removeItemCart)
route.post('/cart/check', authMiddleware, userController.checkIsAdded)

//User Address
route.post('/address', authMiddleware, userController.userAddress)
route.get('/address', authMiddleware, userController.getUserAddress)
route.delete('/address', authMiddleware, userController.removeUserAddress)
route.put('/address/setPrimary', authMiddleware, userController.setPrimaryAddress)
route.put('/address', authMiddleware, userController.updateUserAddress)

//Check-Out Product
route.post('/checkout', authMiddleware, userController.listCheckOutProduk)
route.get('/checkout/:email/:token', authMiddleware, userController.getListCheckOut)

module.exports = route