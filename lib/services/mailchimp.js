'use strict';

const { Service } = require('schmervice');
const Helpers = require('../helpers');

module.exports = class Mailchimp extends Service {

    async signup(email) {

        const url = `https://us17.api.mailchimp.com/3.0/lists/4123041e5d/members`;

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
