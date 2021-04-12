'use strict';

const Boom = require('@hapi/boom');
const { Service } = require('@hapipal/schmervice');
const Helpers = require('../helpers');

module.exports = class Mailchimp extends Service {

    async signup(email) {

        const { mailchimpApiKey, mailchimpListId } = this.options;

        if (!mailchimpApiKey || !mailchimpListId) {
            throw Boom.badImplementation('This plugin requires "mailchimpApiKey" and "mailchimpListId" options to support email signup.');
        }

        const datacenter = mailchimpApiKey.split('-').pop(); // e.g. XXXXXX-usXX -> usXX
        const url = `https://${datacenter}.api.mailchimp.com/3.0/lists/${mailchimpListId}/members`;

        const headers = {
            ...Mailchimp.auth(this.options),
            accept: 'application/json'
        };

        return await Helpers.http.post(url, {
            headers,
            payload: {
                email_address: email,
                status: 'subscribed'
            }
        });
    }

    static auth({ mailchimpApiKey }) {

        return {
            authorization: 'Basic ' + Buffer.from(`hapipal:${mailchimpApiKey}`).toString('base64')
        };
    }
};
