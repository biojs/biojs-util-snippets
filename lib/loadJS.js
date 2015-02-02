var request = require("request");
var q = require('bluebird');
var utils = require("./utils");

function bWrapper(resolve, reject, snip, baseLocal) {
  this.addBody = function(content) {
    if (!content || content.length < 10) {
      return reject("no snippets found");
    }
    snip.inlineScript = "";
    content = utils.translateRelative(content, baseLocal, snip.snippets[0]);

    // inject yourDiv
    if (snip.hasNoHTML) {
      snip.inlineScript = "var yourDiv = document.getElementById('yourDiv');\n";
    }

    snip.inlineScript += content;
    return resolve();
  };
}


module.exports = function(snip, currentSnip, baseLocal) {
  return new q.Promise(function(resolve, reject) {
    var addBody = new bWrapper(resolve, reject, snip, baseLocal).addBody
    if (snip.srcs[currentSnip].js === undefined) {
      return reject("no js");
    } else {
      // the local emulation might directly provide the file content
      if (snip.srcs[currentSnip].js.content) {
        return addBody(snip.srcs[currentSnip].js.content);
      } else {
        var jsURL = utils.convertGithubToRaw(snip.srcs[currentSnip].js.html_url);

        request.get(jsURL, function(err, response, body) {
          if (err) {
            return reject(err);
          }
          addBody(body);
          return resolve();
        });
      }
    }
  });
};
