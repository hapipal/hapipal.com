'use strict';

const Util = require('util');
const HauteCouture = require('haute-couture');
const Package = require('../package.json');

exports.register = Util.callbackify(async (server, options) => {

    await HauteCouture.using()(server, options);

    server.methods.github.markdown = Util.promisify(server.methods.github.markdown);
});

exports.register.attributes = {
    pkg: Package
};
