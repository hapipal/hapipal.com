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
        validate: {
            payload: {
                email: Joi.string().lowercase()
            }
        },
        async handler(request) {

            const { email } = request.payload;

            await this.methods.mailchimp.signup(email);

            return null;
        }
    }
}];
