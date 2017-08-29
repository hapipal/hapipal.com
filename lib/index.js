'use strict';

const Util = require('util');
const HauteCouture = require('haute-couture');
const Package = require('../package.json');

exports.register = (server, options, next) => {

    HauteCouture.using()(server, options, (err) => {

        if (err) {
            return next(err);
        }

        // Promisify cached methods, since they currently must take callbacks
        server.methods.github.markdown = Util.promisify(server.methods.github.markdown);

        return next();
    });
};

exports.register.attributes = {
    pkg: Package
};
