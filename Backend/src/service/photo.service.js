import { apiValidation } from "../validation/api-validation.js"
import { prismaClient } from "../application/database.js"
import { validate } from "../validation/validation.js"
import { ResponseError } from "../error/response.error.js"

const get = async (request) => {
    const data = validate(apiValidation.getPhotoValidation, request)
    const skip = (data.page - 1) * data.size

    const filters = []

    if (data.member_id) {
        filters.push({
            memberId: data.member_id
        })
    }

    if (data.nickname) {
        filters.push({
            member: {
                nickname: {
                    equals: data.nickname,
                    mode: 'insensitive'
                }
            }
        })
    }

    if (data.search) {
        filters.push({
            caption: {
                contains: data.search,
                mode: 'insensitive'
            }
        })
    }
    if (data.source) {
        filters.push({
            source: data.source
        })
    }

    if (data.post_url) {
        filters.push({
            postUrl: data.post_url
        })
    }

    const whereClause = filters.length > 0 ? { AND: filters } : {}

    let orderBy = []
    switch (data.sort) {
        case 'oldest':
            orderBy = [
                { postedAt: 'asc' },
                { id: 'asc' }
            ]
            break;
        case 'newest':
        default:
            orderBy = [
                { postedAt: 'desc' },
                { id: 'asc' }
            ]
            break;
    }

    let photos = []
    let totalItems = 0

    if (data.mode === 'album') {
        photos = await prismaClient.photo.findMany({
            where: whereClause,
            take: data.size,
            skip: skip,
            orderBy: orderBy,
            distinct: ['postUrl'],
            include: {
                member: {
                    select: {
                        id: true,
                        name: true,
                        nickname: true
                    }
                }
            }
        })
        const groupCount = await prismaClient.photo.groupBy({
            by: ['postUrl'],
            where: whereClause,
        })
        totalItems = groupCount.length
    } else {
        photos = await prismaClient.photo.findMany({
            where: whereClause,
            take: data.size,
            skip: skip,
            orderBy: orderBy,
            include: {
                member: {
                    select: {
                        id: true,
                        name: true,
                        nickname: true
                    }
                }
            }
        })
        totalItems = await prismaClient.photo.count({
            where: whereClause
        })
    }

    return {
        data: photos,
        paging: {
            page: data.page,
            total_item: totalItems,
            total_page: Math.ceil(totalItems / data.size)
        }
    }
}

const remove = async (photoId) => {
    const count = await prismaClient.photo.count({
        where: { id: photoId }
    })

    if (count !== 1) {
        throw new ResponseError(404, "Photo not found")
    }

    return prismaClient.photo.delete({
        where: { id: photoId }
    })
}

export const photoService = {
    get,
    remove
}