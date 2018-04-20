'use strict';

const Path = require('path');

module.exports = {
    method: 'get',
    path: '/getting-started',
    options: {
        async handler(request, h) {

            const file = Path.resolve(__dirname, '../content', `getting-started.md`)
            const html = await request.services().github.markdownFromFile(file);

            return h.view('getting-started', { html });
        }
    }
};
