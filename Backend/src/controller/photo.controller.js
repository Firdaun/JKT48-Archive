import { photoService } from "../service/photo.service.js"

const get = async (req, res, next) => {
    try {
        const request = {
            page: req.query.page,
            size: req.query.size,
            member_id: req.query.member_id,
            nickname: req.query.nickname,
            search: req.query.search,
            sort: req.query.sort
        }

        const result = await photoService.get(request)
        res.status(200).json({
            data: result.data,
            paging: result.paging
        })
    } catch (e) {
        next(e)
    }
}

export const photoController = {
    get
}