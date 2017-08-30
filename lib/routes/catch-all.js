'use strict';

const Boom = require('boom');

module.exports = {
    method: '*',
    path: '/{p*}',
    handler(request, reply) {

        return reply(Boom.notFound());
    }
};
