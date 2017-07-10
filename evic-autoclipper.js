// evic-autoclipper.js CasperJS script

const casper = require('casper').create()

const username = casper.cli.get('username')
const password = casper.cli.get('password')

casper.start('https://www.harristeeter.com/specials/evic-coupons-list', function () {
  casper.viewport(1440, 1080) // viewport must be larger than default accommodate the responsive design
  if (!(username && password)) {
    this.echo('username and password required')
    this.exit(1)
  }
})

// OPEN LOGIN FORM
casper.then(function () {
  this.click('.headerLogin')
})

// FILL USERNAME
casper.then(function () {
  this.sendKeys('#emailPopup', username)
  this.click('#btnLogin')
})

// FILL PASSWORD
casper.waitForSelector('#passwordPopup', function () {
  this.sendKeys('#passwordPopup', password)
  this.click('#btnLogin')
}, onTimeout)

casper.wait(12000, function () {
  this.click('.headerLogin')
  this.echo('Logged in as ' + this.getHTML('.login-name-email > h4'))
})

// CLIP
casper.waitFor(function () { return this.evaluate(isReadyToClip) }, function () {
  const unclippedCount = this.evaluate(countUnclipped)
  if (unclippedCount === 0) {
    this.echo('no coupons to clip')
    this.exit()
  } else {
    this.evaluateOrDie(clipAll)
    this.echo('clipping ' + unclippedCount + ' coupons')
  }
}, onTimeout('timeout waiting for ready to clip'))

// PRINT RESULTS
casper.waitUntilVisible('#loader-div', null, null, 10000)
casper.waitWhileVisible('#loader-div', function () {
  var coupons = this.evaluate(getCouponNames)
  this.echo(' - ' + coupons.join('\n - ')).exit()
}, null, null, 40000)

casper.run()

function countUnclipped () {
  return $('.product_info > button').not('.ghost').length
}

function clipAll () {
  $('.product_info > button').not('.ghost').click()
  return true
}

function getCouponNames () {
  return $('.product_name').map(function () { return $(this).html() }).get()
}

function isLoginFinished () {
  return document.querySelector('.headerLogin').textContent.trim() !== 'Login / Sign Up'
}

function isReadyToClip () {
  return $('.product_info > button').length
}

function onTimeout (msg) {
  if (msg == null) {
    msg = 'timeout waiting for page to load'
  }
  return function () {
    this.echo(msg).exit()
  }
}
