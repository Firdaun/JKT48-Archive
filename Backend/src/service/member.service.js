import { prismaClient } from "../application/database.js"
import { apiValidation } from "../validation/api-validation.js"
import { validate } from "../validation/validation.js"

const get = async (request) => {
    const data = validate(apiValidation.getMemberValidation, request)

    const skip = (data.page - 1) * data.size

    const filters = []
    if (data.search) {
        filters.push({
            OR: [
                { name: { contains: data.search, mode: 'insensitive' } },
                { nickname: { contains: data.search, mode: 'insensitive' } },
            ]
        })
    }

    const whereClause = filters.length > 0 ? { AND: filters } : {}

    let orderBy = {}
    switch (data.sort) {
        case 'name-asc':
            orderBy = { name: 'asc' }
            break
        case 'name-desc':
            orderBy = { name: 'desc' }
            break
        case 'gen-asc':
            orderBy = { generation: 'asc' }
            break
        case 'gen-desc':
            orderBy = { generation: 'desc' }
            break
        case 'id':
        default:
            orderBy = { id: 'asc' }
    }

    const dataTable = await prismaClient.member.findMany({
        where: whereClause,
        take: data.size,
        skip: skip,
        orderBy: orderBy,
        include: {
            photos: true
        }
    })

    const totalItems = await prismaClient.member.count({
        where: whereClause
    })

    return {
        data: dataTable,
        paging: {
            page: data.page,
            total_item: totalItems,
            total_page: Math.ceil(totalItems / data.size)
        }
    }
}

const create = async (request) => {
    const member = await prismaClient.member.create({
        data: {
            name: request.name,
            nickname: request.nickname,
            generation: request.generation || 0
        }
    })
    return member
}

export const memberService = {
    get,
    create
}