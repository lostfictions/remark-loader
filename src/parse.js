const FrontMatter = require("front-matter");
const Remark = require("remark");
const RemarkHTML = require("remark-html");
const StripMarkdown = require("strip-markdown");
const Report = require("vfile-reporter");

/**
 * Parse markdown and return the body and imports
 *
 * @param   {string} markdown - Markdown string to be parsed
 * @param   {object} options  - Options passed to the loader
 * @returns {object}          - HTML and imports
 */
module.exports = function (markdown, options = {}) {
  const { plugins = [] } = options;
  const parsed = FrontMatter(markdown);

  return new Promise((resolve, reject) => {
    plugins
      .reduce((remark, item) => {
        if (Array.isArray(item)) {
          return remark.use.apply(null, item);
        } else return remark.use(item);
      }, Remark())
      .use(RemarkHTML)
      .process(parsed.body, (err, file) => {
        const result = {
          content: file.contents,
          attributes: parsed.attributes,
        };

        if (err) reject(Report(err || file));
        else resolve(result);
      });
  }).then(
    (result) =>
      new Promise((resolve, reject) => {
        Remark()
          .use(StripMarkdown)
          .process(parsed.body, (err, file) => {
            if (err) reject(Report(err || file));
            else resolve({ ...result, plaintext: file.contents });
          });
      })
  );
};
