phantasm
========

## Overview

Phantasm is a node.js web service for printing html web pages and is mainly a wrapper around phantomjs.  

## Dependencies

PhantomJS

## Installation

Install PhantomJS and make sure it's in your PATH.

`git clone https://github.com/apollolm/phantasm.git`

...and then...

npm install

## Try it out

node phantasm.js

That should start the service on localhost, port 3000.

Open your browser and type http://localhost:3000

## Usage

Using the form on the page at http://localhost:3000, enter a URL to a page in the URL textbox (remember to include the http://)

Click Submit.  After a few seconds, you should see the rendered image at the bottom of the screen (if you've chosen png, jpg or gif formats).

Use the options (detailed below) to tweak the experience.

## Options
URL:
The most simple scenario is to provide a URL to the service.  The URL will load on the server and PhantomJS will output an image.


Page Load Delay:
Use the Page Load Delay to wait a given number of milliseconds after the page has loaded before capturing the image.  Useful if the page you've entered takes some time to initialize.

Image Format:
PhantomJS can output .png, .jpg, .gif and .pdf

Response Format:
html or json

html will render the result to the web form that was used to submit the request.  Just used to test out your settings mostly.

json - will return a json object with a path to the output image.

Selector:
Use a CSS selector to only return an image for the matching node's area. #mapDiv would only return the map, for example.

Pre-Execution Javascript:
This is the good part.
You can send javascript code to be executed in the page that's been loaded before the image is captured.  Use this to modify the page however you'd like.  If the page you're loading uses jQuery, then you can use jQuery functions to hide or show page elements.  Use function calls to execute custom logic.

Pre-Execution Delay:
How many milliseconds to wait AFTER your Pre-execution javascript is run before capturing the image.
For example, if you call a function that takes a few seconds to kick in, then add a delay of 5 seconds to make sure the code finishes and any page modifications have been made.






