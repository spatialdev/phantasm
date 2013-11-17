phantasm
========

## Overview

Phantasm is a node.js web service for exporting html web pages to PDF, PNG, JPG or GIF.  It is mainly a wrapper around phantomjs.

Required arguments are:

* URL - a URL to be loaded
* Output Format - would you like a PDF or PNG?  

Before an image of the page you've specified is created, you have a chance to pass in javascript commands.


##Installation

* [Ubuntu 12 and 13](/docs/Ubuntu_Install.md)
* [Windows](/docs/Windows_Install.md)
* [OSX](/docs/OSX_Install.md)

## Dependencies

[PhantomJS](http://phantomjs.org/index.html)


## Usage

Using the form on the page at http://localhost:3000, enter a URL to a page in the URL textbox (remember to include the http://)

Click Submit.  After a few seconds, you should see the rendered image at the bottom of the screen (if you've chosen png, jpg or gif formats).

Use the options (detailed below) to tweak the experience.

## Options
#### URL:
The most simple scenario is to provide a URL to the service.  The URL will load in an invisible browser on the server and PhantomJS will output an image.

#### Image Format:
PhantomJS can output .png, .jpg, .gif and .pdf

#### Response Format:
html or json

html - render the result to the web form that was used to submit the request.  Just used to test out your settings mostly.

json - will return a json object with a path to the output image.

#### Selector:
Use a CSS selector to only return an image for the matching node's area. #mapDiv would only return an image showing the area bound by a div with the ID of 'mapDiv', for example.

#### Pre-Execution Javascript:
This is the good part.
You can send javascript code to be executed in the page that's been loaded before the image is captured.  Use this to modify the page however you'd like.  The trick to capturing a user's page as they see is is to steal the DOM nodes you'd like (by cloning them in javascript) and injecting them into a print template HTML page that you've set up.

## Examples

###Posting to this service using jQuery
You can send a javascript ajax request to this service using a POST request.  Here's an example.

	var postArgs = {
		format: "json",
		imageformat: "png"
		url: "http://www.fspmaps.com"
    };

	$.getJSON("http://www.yourinstance.com?callback=?", postArgs).done(function (data) { 
	    //celebrate 
		//Do something with data - the JSON object
	});


####Response JSON
	{
	  "image":"http://print.spatialdev.com/output/phantomoutput12345.png"
	}

####Output Image
![alt text](https://raw.github.com/apollolm/phantasm/master/docs/screens/SimpleOutput.png "Simple Output")


###Simplest example
You want to post

Show selector example

Show Leaflet Map example

Show ESRI Javascript API example






