import express from "express"
import { memberController } from "../controller/member.controller.js"

const adminRouter = new express.Router()

adminRouter.post('/api/admin/members', memberController.add)

export { adminRouter }