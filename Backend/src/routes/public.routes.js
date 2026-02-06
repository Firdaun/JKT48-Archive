import { memberController } from "../controller/member.controller.js"
import { photoController } from "../controller/photo.controller.js"
import express from "express"
const publicRouter = new express.Router()

publicRouter.get('/api/members', memberController.list)
publicRouter.get('/api/photos', photoController.get)

export {
    publicRouter
}