'use strict';

const Path = require('path');
const { Service } = require('schmervice');
const Boom = require('boom');
const Content = require('../content');

module.exports = class BestPractices extends Service {

    get(slug) {

        const bp = Content.bestPractices[slug];

        if (!bp) {
            throw Boom.notFound();
        }

        return {
          slug,
          filename: Path.resolve(__dirname, '../content/best-practices', `${slug}.md`),
          ...bp
        };
    }

    list() {

        const toList = (list, key) => list.concat(this.get(key));

        return Object.keys(Content.bestPractices).reduce(toList, []);
    }
};
