var page = require('webpage').create();
page.viewportSize = {width: 1280, height: 1080};
page.clipRect = {width: 1280, height: 1080};

phantom.onError = function(msg) { console.log("[ERROR] " + msg); phantom.exit(2); };
page.onError = function(msg) { console.log("[ERROR] " + msg); phantom.exit(2); };

function Tag(name, attrs, children) {
  this.name = name;
  this.attrs = attrs;
  this.children = children;
}

Tag.prototype.write = function() {
  var attrs = this.attrs;
  var openTagStart = "<" + this.name;
  var attrStrings = Object.keys(attrs).map(function(key) {
    return key + "='" + attrs[key] + "'";
  });
  var openTagEnd = this.children ? ">" : "/>";
  var isTextNode = function(node) { return typeof node === 'string'; };
  console.log([openTagStart].concat(attrStrings).concat([openTagEnd]).join(' '));
  
  if (this.children) {
    this.children.forEach(function(child) {
      if (isTextNode(child)) {
        console.log(child);
      } else {
        child.write();
      }
    });
    console.log("</" + this.name + ">");
  }
};

var successNode = function(testname) {
  return new Tag("testcase", {classname: "Jasmine", testname: testname});
};

var failureNode = function(testname) {
  return new Tag("testcase", {classname: "Jasmine", testname: testname}, 
    [new Tag("failure", {type: "Error"}, 
      ["View screenshot for error details"])]);
};

page.open('SpecRunner.html', function(status) {
  setTimeout(function() {
  try {
    var testResults = page.evaluate(function() {
      var root = document.getElementsByClassName("jasmine-symbol-summary")[0];
      var results = [];
      for (var i=0; i<root.children.length; i++) {
        var child = root.children[i];
        results.push({
          title: child.getAttribute("title"),
          passed: child.className.match(/\bjasmine-passed\b/) !== null
        });
      }
      return results;
    });

    var resultNodes = testResults.map(function(node) {
      if (node.passed) {
        return successNode(node.title);
      } else {
        return failureNode(node.title);
      }
    });

    var numTests = testResults.length;
    var numPassedTests = testResults.filter(function(node) { return node.passed }).length;
    var testsuite = new Tag("testsuite", {
      tests: numTests,
      passed: numPassedTests,
      failed: numTests - numPassedTests
    }, resultNodes);
    testsuite.write();
    
    page.render('jasmine-reports/jasmine.png');
    
    if (numPassedTests === numTests) {
      phantom.exit();
    } else {
      phantom.exit(1);
    }
  } catch (e) {
    console.log("[ERROR] " + e.message);
    phantom.exit(2);
  }
  }, 5000);
});
