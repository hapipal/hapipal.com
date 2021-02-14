'use strict';

const HauteCouture = require('@hapipal/haute-couture');
const Package = require('../package.json');

module.exports = {
    pkg: Package,
    register: async (server, options) => {

        await HauteCouture.compose(server, options);
    }
};
