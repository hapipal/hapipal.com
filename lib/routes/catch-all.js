'use strict';

const Boom = require('@hapi/boom');

module.exports = {
    method: '*',
    path: '/{p*}',
    handler(request) {

        throw Boom.notFound();
    }
};
