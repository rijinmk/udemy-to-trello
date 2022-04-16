var page = require('webpage').create();
page.open(
  'https://www.udemy.com/course/complete-python-bootcamp/',
  function () {
    page.render('github.png');
    phantom.exit();
  }
);
