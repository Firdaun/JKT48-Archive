import { memberController } from "../controller/member.controller.js"
import express from "express"
import { photoController } from "../controller/photo.controller.js"
const publicRouter = new express.Router()

publicRouter.get('/api/members', memberController.list)
publicRouter.get('/api/photos', photoController.get)

export {
    publicRouter
}