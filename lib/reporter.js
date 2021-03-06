
/**
 * Expose `LCov`.
 */

var fs = require('fs')
  , Base = require('mocha/lib/reporters/base')
  , lcov = require('./lcov')
  , HTMLCov = require('./html-cov');

exports = module.exports = Reporter;

/**
 * Initialize a new LCOV reporter.
 * File format of LCOV can be found here: http://ltp.sourceforge.net/coverage/lcov/geninfo.1.php
 * The reporter is built after this parser: https://raw.github.com/SonarCommunity/sonar-javascript/master/sonar-javascript-plugin/src/main/java/org/sonar/plugins/javascript/coverage/LCOVParser.java
 *
 * @param {Runner} runner
 * @api public
 */

function Reporter(runner, options) {
  _baseReporter = 'spec'
  BaseReporter = null

  if (options && options.base_reporter) {
    _baseReporter = options.base_reporter;
  }
  if ('function' == typeof _baseReporter) {
    BaseReporter = _baseReporter;
  } else {
    var _reporter;
    try { _reporter = require('mocha/lib/reporters/' + _baseReporter); } catch (err) {};
    if (!_reporter) try { _reporter = require(_baseReporter); } catch (err) {};
    if (!_reporter) throw new Error('invalid reporter "' + _baseReporter + '"');
    BaseReporter = _reporter;
  }
  BaseReporter.call(this, runner, options);

  runner.on('end', function(datas){
    var cov = global._$jscoverage;
    if(datas && datas.cov) {
      cov = {};
      for(var prop in datas.cov) {
        file = datas.cov[prop];
        file.source = file[0];
        file[0] = null;
        cov[prop] = file;
      }
    }

    if(cov) {
      try {
        fs.mkdirSync('coverage');
      } catch(e) {}

      fs.writeFileSync("coverage/coverage.lcov", lcov(cov));
      fs.writeFileSync("coverage/coverage.html", HTMLCov(cov));
    }
  });
};
Reporter.prototype.__proto__ = Base.prototype;
