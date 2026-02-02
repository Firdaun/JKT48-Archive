import express from "express"
import { memberController } from "../controller/member.controller.js"

const adminRouter = new express.Router()

adminRouter.post('/api/admin/members', memberController.add)
adminRouter.put('/api/admin/members/:id', memberController.update)
adminRouter.delete('/api/admin/members/:id', memberController.remove)

export { adminRouter }