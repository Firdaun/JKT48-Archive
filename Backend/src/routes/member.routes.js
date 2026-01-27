import { memberController } from "../controller/member.controller.js"
import express from "express"
const router = new express.Router()

router.get('/api/members', memberController.list)
router.post('/api/members', memberController.add)

export {
    router
}