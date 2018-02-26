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

        return Object.keys(Content.bestPractices).map((slug) => this.get(slug));
    }
};
