'use strict';

const Toys = require('@hapipal/toys');

module.exports = Toys.onPreResponse((request, h) => {

    const { response, route } = request;

    if (!response.isBoom) {
        return h.continue;
    }

    const tags = [].concat(route.settings.tags || []);

    if (tags.includes('api')) {
        return h.continue;
    }

    const { statusCode } = response.output;
    const { message } = response.output.payload;

    request.log('error', response);

    return h.view('error', { statusCode, message }).code(statusCode);
}, {
    sandbox: 'plugin'
});
