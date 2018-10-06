// evic-autoclipper.js CasperJS script

const casper = require('casper').create()

const debug = casper.cli.has('capture')
const username = casper.cli.get('username')
const password = casper.cli.get('password')
const progress = casper.cli.get('progress')

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
  this.waitUntilVisible('.HeaderMiddlePart #emailPopup', function () {
    this.sendKeys('.HeaderMiddlePart #emailPopup', username)
    this.click('.HeaderMiddlePart #btnLogin')
  }, onTimeout('clicking login popup'))
})

// FILL PASSWORD
casper.waitForSelector('.HeaderMiddlePart #passwordPopup', function () {
  this.sendKeys('.HeaderMiddlePart #passwordPopup', password)
  this.click('.HeaderMiddlePart #btnLogin')
}, onTimeout)

casper.wait(12000, function () {
  capture('logged-in.png')
  this.echo('Logged in as ' + this.getHTML('.login-name-email > h4'))
})

// LOAD ALL
casper.waitFor(function () { return this.evaluate(isReadyToLoad) }, function () {
  while (this.visible('.loadmore_coupons > a')) {
    this.click('.loadmore_coupons > a')
  }
  capture('all-loaded.png')
}, onTimeout('waiting for coupons to load'))

// CLIP
const clipped = []
casper.then(function clip () {
  const remaining = this.evaluate(countUnclipped)
  if (remaining > 0) {
    if (progress) {
      this.echo('clipping, ' + remaining + ' remaining')
    }
    const name = this.evaluate(clipNext)
    if (!name) {
      this.echo('Error clipping coupon').exit()
    }
    clipped.push(name)
    this.waitUntilVisible('#loader-div', function () {
      this.waitWhileVisible('#loader-div', function () {
        this.waitUntilVisible('.special-error-dialog', function () {
          this.echo('Reached coupon limit')
          this.echo('Coupons').echo(' - ' + clipped.join('\n - '))
          this.exit()
        }, clip, 1000)
      }, onTimeout('waiting for clip operation to finish'), null, 40000)
    }, onTimeout('waiting for clip operation to finish', 15000))
  }
})



// REPORT
casper.then(function () {
  capture('all-clipped.png')
  casper.echo('Coupons').echo(' - ' + clipped.join('\n - '))
})

casper.run()

function countUnclipped () {
  return $('.productbox button').filter(function (index, element) { return element.textContent === 'Clip' }).length
}

function clipAll () {
  return $('.productbox button').filter(function (index, element) { return element.textContent === 'Clip' }).click()
  return true
}

function clipNext () {
  const $btn = $('.productbox button').filter(function (index, element) { return element.textContent === 'Clip' }).first()
  $btn.click()
  return $btn.parents('.product_infoBox').find('.product_name').html()
}

function getCouponNames () {
  return $('.product_name').map(function () { return $(this).html() }).get()
}

function isLoginFinished () {
  return document.querySelector('.headerLogin').textContent.trim() !== 'Login / Sign Up'
}

function isReadyToLoad () {
  return $('.productbox button').length
}

function onTimeout (msg) {
  if (msg == null) {
    msg = 'timeout waiting for page to load'
  }
  return function () {
    this.echo(msg).exit()
    capture('on-timeout.png')
  }
}

function capture(screenshot) {
  if (debug) {
    casper.capture('screenshots/' + screenshot)
  }
}
