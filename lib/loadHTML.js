var request = require("request");
var q = require('bluebird');
var utils = require("./utils");

function addHTML(snip, body, baseLocal) {
  body = utils.translateRelative(body, baseLocal, snip.snippets[0]);
  snip.inlineBody = body;
}

module.exports = function(snip, currentSnip, baseLocal) {
  return new q.Promise(function(resolve, reject) {
    if (snip.srcs[currentSnip].html !== undefined) {
      if (snip.srcs[currentSnip].html.content) {
        addHTML(snip, snip.srcs[currentSnip].html.content, baseLocal);
      } else {
        var htmlURL = utils.convertGithubToRaw(snip.srcs[currentSnip].html.html_url);
        request.get(htmlURL, function(err, response, body) {
          if (err) {
            return reject(err);
          }
          addHTML(snip, body, baseLocal);
          resolve();
        });
      }
    } else {
      snip.inlineBody = "<div id=yourDiv></div>";
      snip.hasNoHTML = true;
      resolve("no html");
    }
  });
};
