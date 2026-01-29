import express from "express"
import cors from "cors"
import { publicRouter } from "./routes/public.routes.js"
import { authMiddleware } from "./middleware/auth.middleware.js"
import { adminRouter } from "./routes/admin.routes.js"

const app = express()
const port = 3000

app.use(cors())
app.use(express.json())

app.use(publicRouter)
app.use(authMiddleware)
app.use(adminRouter)


app.listen(port, () => {
    console.log(`server active in port${port}`)
})