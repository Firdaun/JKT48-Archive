import { prismaClient } from "../application/database.js"
import { ResponseError } from "../error/response.error.js"
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

    let orderBy = []
    switch (data.sort) {
        case 'name-asc':
            orderBy = [{ name: 'asc' }, { id: 'asc' }]
            break
        case 'name-desc':
            orderBy = [{ name: 'desc' }, { id: 'asc' }]
            break
        case 'gen-asc':
            orderBy = [{ generation: 'asc' }, { name: 'asc' }]
            break
        case 'gen-desc':
            orderBy = [{ generation: 'desc' }, { name: 'asc' }]
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

const update = async (request) => {
    const data = validate(apiValidation.updateMemberValidation, request)

    const totalInDatabase = await prismaClient.member.count({
        where: {
            id: data.id
        }
    })

    if (totalInDatabase !== 1) {
        throw new ResponseError(404, "Member isn't found")
    }

    return prismaClient.member.update({
        where: {
            id: data.id
        },
        data: {
            name: data.name,
            nickname: data.nickname,
            generation: data.generation
        }
    })
}

const remove = async (memberId) => {
    memberId = validate(apiValidation.getMemberIdValidation, memberId)

    const totalInDatabase = await prismaClient.member.count({
        where: {
            id: memberId
        }
    })

    if (totalInDatabase !== 1) {
        throw new ResponseError(404, "Member isn't found")
    }

    return prismaClient.member.delete({
        where: {
            id: memberId
        }
    })
}

export const memberService = {
    get,
    create,
    update,
    remove
}