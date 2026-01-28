import { memberController } from "../controller/member.controller.js"
import express from "express"
const publicRouter = new express.Router()

publicRouter.get('/api/members', memberController.list)

export {
    publicRouter
}