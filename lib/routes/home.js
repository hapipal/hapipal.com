'use strict';

const Joi = require('joi');

module.exports = [{
    method: 'get',
    path: '/',
    handler: {
        view: {
            template: 'home'
        }
    }
},
{
    method: 'post',
    path: '/mailchimp',
    options: {
        tags: ['api'],
        validate: {
            payload: Joi.object({
                email: Joi.string().email().required()
            })
        },
        async handler(request) {

            const { email } = request.payload;

            await request.services().mailchimp.signup(email);

            return null;
        }
    }
}];
