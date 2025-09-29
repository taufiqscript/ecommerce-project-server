const OK = (response, statusCode, data, message) => {
    return response.status(statusCode).json({ isError: false, data, message })
}

const ERR = (response, statusCode, message) => {
    return response.status(statusCode).json({ isError: true, message })
}

module.exports = { OK, ERR }