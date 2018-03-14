'use strict';

const { Service } = require('schmervice');
const Helpers = require('../helpers');

module.exports = class Mailchimp extends Service {

    constructor(...args) {

        super(...args);

        this.dc = this.options.mailchimpApiKey.split('-').pop(); // e.g. XXXXXX-usXX -> usXX
    }

    async signup(email) {

        const url = `https://${this.dc}.api.mailchimp.com/3.0/lists/${this.options.mailchimpListId}/members`;

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
