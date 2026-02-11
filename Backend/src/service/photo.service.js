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

    const whereClause = filters.length > 0 ? { AND: filters } : {}

    let orderBy = []
    switch (data.sort) {
        case 'oldest':
            orderBy = [
                { postedAt: 'asc'},
                { fileId: 'asc' }
            ]
            break;
        case 'newest':
        default:
            orderBy = [
                { postedAt: 'desc' },
                { fileId: 'asc' }
            ]
            break;
    }

    const photos = await prismaClient.photo.findMany({
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

    const totalItems = await prismaClient.photo.count({
        where: whereClause
    })

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