'use strict';

module.exports = (server, options) => ({
    type: 'onPreResponse',
    method: (request, h) => {

        if (!options.isGlitchDeploy) {
            return h.continue;
        }

        // Glitch adds an x-powered-by header that doesn't feel entirely appropriate for pal

        const { response } = request;

        if (response.isBoom) {
            response.output.headers['x-powered-by'] = '¯\\_(^-^)_/¯';
        }
        else {
            response.header('x-powered-by', '¯\\_(^-^)_/¯');
        }

        return h.continue;
    }
});
