import express from "express"
import cors from "cors"
import { router } from "./routes/member.routes.js"

const app = express()
const port = 3000

app.use(cors())
app.use(express.json())

app.use(router)

app.listen(port, () => {
    console.log(`server active in port${port}`)
})