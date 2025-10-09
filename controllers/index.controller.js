require('dotenv').config()
const { default: mongoose } = require('mongoose')
const { User } = require('../models/index.model')
const { OK, ERR } = require('../utils/response')
const bcrypt = require('bcrypt')
const JWT = require('jsonwebtoken')
const { SECRET_KEY } = process.env

const signUpUser = async (req, res) => {
    try {
        const { email, password } = req.body

        let user = await User.findOne({ email })
        if (user) {
            return ERR(res, 400, "Email is already exists!")
        } else if (!email || !password) {
            return ERR(res, 400, "The email or password fields cannot be empty!")
        } else if (password.length <= 6) {
            return ERR(res, 400, 'Password must be more than 6 characters')
        }

        const hashPass = await bcrypt.hash(password, 10)
        const addNewUser = await new User({ email, password: hashPass })
        await addNewUser.save()

        return OK(res, 201, null, "Sign Up Success")
    } catch (error) {
        console.log(error)
    }
}

const signInUser = async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await User.findOne({ email })
        if (!user) return ERR(res, 400, "User not found!")

        const verifyPass = await bcrypt.compare(password, user.password)
        if (!verifyPass) return ERR(res, 400, "Password wrong!")

        const token = await JWT.sign(
            { id: user._id, email: user.email },
            SECRET_KEY,
            { expiresIn: "12h" }
        )
        const userId = user._id
        user.token = token
        await user.save()

        return OK(res, 200, { token, userId }, "Sign In success")
    } catch (error) {
        console.log(error)
        return ERR(res, 500, 'Internal server error!')
    }
}

const googleLogin = async (req, res) => {
    try {
        const { email, name, googleId } = req.body

        let user = await User.findOne({ email })
        if (!user) {
            user = await User.create({
                email,
                name,
                googleId,
                password: null
            })
        }

        const token = await JWT.sign(
            { id: user._id, email: user.email },
            SECRET_KEY,
            { expiresIn: "12h" }
        )
        const userId = user._id
        user.token = token
        await user.save()

        return OK(res, 200, { token, userId }, "Google login success")
    } catch (error) {
        console.log(error)
        return ERR(res, 500, "Internal server error!")
    }
}

const signOutUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)

        user.token = null
        await user.save()

        return OK(res, 200, null, "Sign Out success")
    } catch (error) {
        console.log(error)
    }
}

const getMyShoppingCart = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)

        return OK(res, 200, user.shoppingCart, "Getting my shopping cart success")
    } catch (error) {
        console.log(error)
    }
}

const addToShoppingCart = async (req, res) => {
    try {
        const { data } = req.body
        const user = await User.findById(req.user.id)

        const cartExists = await user.shoppingCart.some(result => result.id === data.id)
        if (cartExists) return ERR(res, 400, "Item is already exists!")

        await user.shoppingCart.push(data)
        await user.save()

        return OK(res, 201, data, "Add to shopping cart success")
    } catch (error) {
        console.log(error)
    }
}

const checkIsAdded = async (req, res) => {
    try {
        const { cartId } = req.body
        const user = await User.findById(req.user.id)

        const isAdded = await user.shoppingCart.some(result => result.id === cartId)

        return OK(res, 201, { isAdded }, "Checking is added success")
    } catch (error) {
        console.log(error)
    }
}

const removeItemCart = async (req, res) => {
    try {
        let { cartId } = req.body

        if (!Array.isArray(cartId)) {
            cartId = [cartId]
        }

        const user = await User.findById(req.user.id)

        const checkingId = await user.shoppingCart.some(result => cartId.includes(result.id))
        if (!checkingId) return ERR(res, 400, "Cart ID not found!")

        user.shoppingCart = await user.shoppingCart.filter(result => !cartId.includes(result.id))
        await user.save()

        return OK(res, 200, null, "Removing success")
    } catch (error) {
        console.log(error)
    }
}

const userAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)

        const newAddress = { id: new mongoose.Types.ObjectId(), isPrimary: user.address.length === 0, ...req.body }

        user.address.push(newAddress)
        await user.save()

        return OK(res, 201, newAddress, "Successfully added address")
    } catch (error) {
        console.log(error.message)
        return ERR(res, 500, error.message)
    }
}

const getUserAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)

        return OK(res, 200, user.address, "Getting address user success")
    } catch (error) {
        console.log(error)
    }
}

const updateUserAddress = async (req, res) => {
    try {
        const { addressId, ...updateData } = req.body

        const user = await User.findById(req.user.id)

        const address = user.address.id(addressId)
        if (!address) return ERR(res, 404, "ID address not found!")

        Object.assign(address, updateData)

        if (updateData.isPrimary) {
            user.address.forEach(addr => {
                addr.isPrimary = false
            })
            address.isPrimary = true
        }

        await user.save()

        return OK(res, 200, null, "Update user address success")
    } catch (error) {
        return ERR(res, 500, "Fail update user address!")
    }
}

const removeUserAddress = async (req, res) => {
    try {
        let { addressId } = req.body
        const user = await User.findById(req.user.id)

        if (!Array.isArray(addressId)) {
            addressId = [addressId]
        }

        const checkAddressId = user.address.some(result => addressId.includes(result.id))
        if (!checkAddressId) return ERR(res, 404, "ID address not found!")

        user.address = user.address.filter(result => !addressId.includes(result.id.toString()))
        await user.save()

        return OK(res, 200, null, "Remove address success")
    } catch (error) {
        console.log(error)
    }
}

const setPrimaryAddress = async (req, res) => {
    try {
        const { addressId } = req.body
        const user = await User.findById(req.user.id)

        user.address.forEach(addr => { addr.isPrimary = false })

        const target = user.address.id(addressId)
        if (target) target.isPrimary = true

        await user.save()

        return OK(res, 200, target, "Success update main address")
    } catch (error) {
        return ERR(res, 500, "Fail update main address")
    }
}

const listCheckOutProduk = async (req, res) => {
    try {
        let { data } = req.body
        const user = await User.findById(req.user.id)

        if (!Array.isArray(data)) {
            data = [data]
        }

        user.checkOutProduk = data

        await user.save()

        return OK(res, 201, data, "Success add product to check out")
    } catch (error) {
        console.log(error)
        return ERR(res, 500, error.message || error)
    }
}

const getListCheckOut = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)

        return OK(res, 200, user.checkOutProduk, "Success getting list check out")
    } catch (error) {
        console.log(error)
        return ERR(res, 500, error.message || error)
    }
}

module.exports = {
    signUpUser,
    signInUser,
    signOutUser,
    addToShoppingCart,
    removeItemCart,
    checkIsAdded,
    getMyShoppingCart,
    userAddress,
    getUserAddress,
    removeUserAddress,
    setPrimaryAddress,
    updateUserAddress,
    listCheckOutProduk,
    getListCheckOut,
    googleLogin
}