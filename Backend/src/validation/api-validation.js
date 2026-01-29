import Joi from 'joi'
const getMemberValidation = Joi.object({
    page: Joi.number().min(1).positive().default(1),
    size: Joi.number().min(1).positive().max(100).default(10),
    search: Joi.string().optional().allow(''),
    sort: Joi.string().valid('id', 'name-asc', 'name-desc', 'gen-asc', 'gen-desc').optional().default('id')
})

export const apiValidation = {
    getMemberValidation
}