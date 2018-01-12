'use strict';

const { Service } = require('schmervice');
const Helpers = require('../helpers');

module.exports = class Github extends Service {

    async markdown(owner, name, file, version) {

        const url = `https://api.github.com/repos/${owner}/${name}/contents/${file}?ref=v${version}`;

        const headers = {
            ...Github.auth(this.options),
            accept: 'application/vnd.github.3.html'
        };

        const { payload } = await Helpers.http.get(url, { headers });

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
            }
        };
    }
};
