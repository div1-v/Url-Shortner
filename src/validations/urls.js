const joi = require("joi");

exports.shortenUrlValidation = joi.object({
    longUrl: joi.string()
        .uri()
        .required()
        .messages({
            'string.base': '"longUrl" should be a type of \'string\'',
            'string.uri': '"longUrl" must be a valid URL',
            'any.required': '"longUrl" is required'
        }),

    customAlias: joi.string()
        .optional()
        .messages({
            'string.base': '"customAlias" should be a type of \'string\''
        }),

    topic: joi.string()
        .optional()
        .messages({
            'string.base': '"topic" should be a type of \'string\''
        })
});

exports.shortenUrlAliasValidation = joi.object({

    alias: joi.string()
        .optional()
        .messages({
            'string.base': '"customAlias" should be a type of \'string\''
        }),
});