import Joi from 'joi'
const getMemberValidation = Joi.object({
    page: Joi.number().min(1).positive().default(1),
    size: Joi.number().min(1).positive().max(100).default(10),
    search: Joi.string().optional().allow(''),
    sort: Joi.string().valid('id', 'name-asc', 'name-desc', 'gen-asc', 'gen-desc').optional().default('id')
})

const getMemberIdValidation = Joi.number().positive().required()

const updateMemberValidation = Joi.object({
    id: Joi.number().positive().required(),
    name: Joi.string().min(1).max(100).required(),
    nickname: Joi.string().min(1).max(100).required(),
    generation: Joi.number().min(1).positive().required()
})

export const apiValidation = {
    getMemberValidation,
    updateMemberValidation,
    getMemberIdValidation
}