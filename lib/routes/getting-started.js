'use strict';

const Path = require('path');
const Stream = require('stream');
const NodeUtil = require('util');
const Trumpet = require('trumpet');
const ConcatStream = require('concat-stream');

const Pipeline = NodeUtil.promisify(Stream.pipeline);

module.exports = {
    method: 'get',
    path: '/getting-started',
    options: {
        async handler(request, h) {

            const file = Path.resolve(__dirname, '../content', 'getting-started.md');
            const html = await request.services().github.markdownFromFile(file);

            const tr = Trumpet();
            tr.selectAll('a', (elem) => {

                elem.setAttribute('target', '_blank');
            });

            let linkified = '';
            await Pipeline(
                Stream.Readable.from(html),
                tr,
                ConcatStream((hm) => {

                    linkified = hm.toString();
                })
            );

            return h.view('getting-started', { html: linkified });
        }
    }
};
