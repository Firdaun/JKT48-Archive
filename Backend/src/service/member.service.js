import { prismaClient } from "../application/database.js"

const getAll = async () => {
    return await prismaClient.member.findMany()
}

const create = async (request) => {
    const member = await prismaClient.member.create({
        data:{
            name: request.name,
            nickname: request.nickname
        }
    })
    return member
}

export const memberService = {
    getAll,
    create
}