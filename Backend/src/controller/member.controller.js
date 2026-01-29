import { memberService } from "../service/member.service.js"

const list = async (req, res, next) => {
    try {
        const result = await memberService.get(req.query)
        res.status(200).json({
            data: result.data,
            paging: result.paging
        })
    } catch (e) {
        next(e)
    }
}

const add = async (req, res, next) => {
    try {
        const result = await memberService.create(req.body)
        res.status(201).json({
            data: result
        })
    } catch (e) {
        next(e)
    }
}

export const memberController = {
    list,
    add
}