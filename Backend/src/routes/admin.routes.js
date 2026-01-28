import express from "express"
import { memberController } from "../controller/member.controller.js"

const adminRouter = new express.Router()

// Admin boleh NAMBAH & HAPUS
adminRouter.post('/api/admin/members', memberController.add)
// adminRouter.delete('/api/admin/members/:id', memberController.remove)

export { adminRouter }