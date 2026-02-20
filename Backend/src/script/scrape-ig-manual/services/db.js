import { prismaClient } from "../../../application/database.js"

export const getMember = async (nickname) => {
    return await prismaClient.member.findFirst({
        where: { nickname: { equals: nickname, mode: 'insensitive' } }
    })
}

export const checkPostExists = async (postUrl) => {
    return await prismaClient.photo.findFirst({
        where: { postUrl: postUrl }
    })
}

export const saveMedia = async (data) => {
    return await prismaClient.photo.create({
        data: {
            srcUrl: data.dbUrl,
            fileId: data.fileId,
            caption: data.caption,
            postUrl: data.postUrl,
            mediaType: data.mediaTypeDB,
            postedAt: data.postedAt,
            memberId: data.memberId,
            source: 'instagram'
        }
    })
}