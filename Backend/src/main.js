import express from "express"
const app = express()
const port = 3000

app.get('/', (req, res) => {
    res.send('JKT48 Archive Bot Is Running!')
})

app.listen(port, () => {
    console.log(`server jalan di port${port}`);
})