'use strict';

const Helpers = require('../helpers');

const internals = {};

module.exports = (srv, options) => ([
    {
        name: 'mailchimp.signup',
        method: async (email) => {

            const url = `https://us17.api.mailchimp.com/3.0/lists/4123041e5d/members`;

            const headers = internals.auth(options, {
                accept: 'application/json'
            });

            return await Helpers.http.post(url, {
                headers,
                payload:
                    {
                        email_address: email,
                        status: 'subscribed'
                    }
            });
        },
        options: {
            callback: false
        }
    }
]);

internals.auth = (options, additional = {}) => {

    const headers = {
        authorization: 'Basic ' + Buffer.from(`hapipal:${options.mailchimpApiKey}`).toString('base64')
    };

    return Object.assign(headers, additional);
};
