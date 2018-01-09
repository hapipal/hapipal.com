'use strict';

const Boom = require('boom');

module.exports = {
    method: '*',
    path: '/{p*}',
    handler(request) {

        throw Boom.notFound();
    }
};
