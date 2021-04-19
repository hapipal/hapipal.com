'use strict';

const { promises: Fs } = require('fs');
const Stream = require('stream');
const { Service } = require('@hapipal/schmervice');
const Helpers = require('../helpers');

module.exports = class Github extends Service {

    async markdown(owner, name, file, ref) {

        const url = `https://api.github.com/repos/${owner}/${name}/contents/${file}?ref=${ref}`;

        const headers = {
            ...Github.auth(this.options),
            accept: 'application/vnd.github.3.html'
        };

        const { payload } = await Helpers.http.get(url, { headers });

        return payload.toString();
    }

    async markdownFromFile(filename) {

        const url = 'https://api.github.com/markdown/raw';

        const headers = {
            ...Github.auth(this.options),
            'content-type': 'text/x-markdown',
            accept: 'application/vnd.github.3.html'
        };

        const file = await Fs.readFile(filename);

        const { payload } = await Helpers.http.post(url, { payload: file, headers });

        return payload.toString();
    }

    static auth({ githubToken }) {

        return {
            authorization: `token ${githubToken}`
        };
    }

    static get caching() {

        return {
            markdown: {
                expiresIn: Helpers.time.oneYearInMs,
                generateTimeout: Helpers.time.oneMinuteInMs
            },
            markdownFromFile: {
                expiresIn: Helpers.time.oneYearInMs,
                generateTimeout: Helpers.time.oneMinuteInMs
            }
        };
    }
};
