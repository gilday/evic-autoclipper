# evic-autoclipper

Script for automatically clipping Harris Teeter E-Vic coupons. Run this script
on a schedule to help your grocery bill with little effort.

The script uses [CasperJS](http://casperjs.org/) to execute the
`evic-autoclipper.js` script in a PhantomJS browser. The script navigates to
harristeeter.com,  performs a log-in, then clips all available E-Vic coupons.


## Run with Docker

The recommended way to run evic-autoclipper is with Docker

    docker run --rm gilday/evic-autoclipper --username=<evic-username> --password=<evic-password>
