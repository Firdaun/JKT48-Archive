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

const update = async (req, res, next) => {
    try {
        const memberId = req.params.id

        const request = {
            ...req.body,
            id: memberId
        }

        const result = await memberService.update(request)
        res.status(200).json({
            data: result
        })
    } catch (e) {
        next(e)
    }
}

const remove = async (req, res, next) => {
    try {
        const memberId = req.params.id

        await memberService.remove(memberId)
        res.status(200).json({
            data: 'OK'
        })
    } catch (e) {
        next(e)
    }
}

export const memberController = {
    list,
    add,
    update,
    remove
}