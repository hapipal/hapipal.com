'use strict';

module.exports = {
    type: 'onPreResponse',
    method: (request, reply) => {

        const { response } = request;

        if (!response.isBoom) {
            return reply.continue();
        }

        const { statusCode } = response.output;
        const { message } = response.output.payload;

        return reply.view('error', { statusCode, message }).code(statusCode);
    },
    options: {
        sandbox: 'plugin'
    }
};
