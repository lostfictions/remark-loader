const Utils = require("loader-utils");
const HTMLLoader = require("html-loader");
const parse = require("./parse.js");

/**
 * Primary loader function
 *
 * @param {string} content - Markdown file content
 */
module.exports = function (content) {
  const callback = this.async();
  const options = Utils.getOptions(this);

  const { htmlLoaderOptions } = options || {};

  let attributes;
  let plaintext;

  parse(content, options)
    .then((processed) => {
      attributes = processed.attributes;
      plaintext = processed.plaintext;

      const options = Object.assign({}, htmlLoaderOptions, { esModule: true });
      const context = Object.assign({}, this, { query: options });

      return HTMLLoader.call(context, processed.content);
    })
    .then((resolved) => {
      callback(
        null,
        [
          resolved,
          `;export const attributes = ${JSON.stringify(attributes)};`,
          `;export const plaintext = ${JSON.stringify(plaintext)}`,
        ].join("\n")
      );
    })
    .catch(callback);
};
