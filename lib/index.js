'use strict';

const HauteCouture = require('haute-couture');
const Package = require('../package.json');

module.exports = {
    pkg: Package,
    register: HauteCouture.using()
};
