export const authMiddleware = (req, res, next) => {
    const secretKey = req.get('X-API-KEY')

    if (secretKey === 'rahasia-negara-jkt48') {
        next()
    } else {
        res.status(401).json({error: 'tidak boleh masuk!'})
    }
}