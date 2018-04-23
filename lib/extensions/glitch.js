'use strict';

const Toys = require('toys');

module.exports = Toys.onPreResponse((request, h) => {

    const { isGlitchDeploy } = Toys.options(h);

    if (!isGlitchDeploy) {
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
});
