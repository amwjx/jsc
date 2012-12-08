



/**
 * http://lifesinger.org/lab/2011/remove-comments-safely/
 * @param {String} code
 */
function removeComments(code) {
return code
    .replace(/(?:^|\n|\r)\s*\/\*[\s\S]*?\*\/\s*(?:\r|\n|$)/g, '\r\n')
    .replace(/(?:^|\n|\r)\s*\/\/.*(?:\r|\n|$)/g, '\r\n');
};

module.exports = removeComments;
