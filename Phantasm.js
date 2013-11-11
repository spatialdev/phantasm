
/**
 * Module dependencies.
 */
var phantom = require('node-phantom');

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , flow = require('flow')
  , shortId = require('shortid');

var app = express();

var routes = [];

// all environments
app.set('ipaddr', 'localhost');
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(require('less-middleware')({ src: __dirname + '/public' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use("/output", express.static(path.join(__dirname, 'output')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

//Define Routes
routes['print'] = function (req, res) {

    if (JSON.stringify(req.body) != '{}') {
        //Gather options
        var url = "";
        if (req.body.url) {
            url = req.body.url;
        }
        else {
            routes['onError'](req, res, "print", "You must specify a URL.");
        }

        //var delay = 1000;
        //if (req.body.delay) {
        //    delay = req.body.delay;
        //    if (IsNumeric(delay)) {
        //        delay = parseInt(delay);
        //    }
        //    else {
        //        delay = 1000;
        //        req.params.infoMessage = "Delay was non-numeric.  Defaulting to 1000 ms";
        //    }
        //}
        //else {
        //    delay = 1000;
        //}

        //var pedelay = 1000;
        //if (req.body.pedelay) {
        //    pedelay = req.body.pedelay;
        //    if (IsNumeric(pedelay)) {
        //        pedelay = parseInt(pedelay);
        //    }
        //    else {
        //        pedelay = 1000;
        //        req.params.infoMessage = "Pre-execution delay was non-numeric.  Defaulting to 1000 ms";
        //    }
        //}
        //else {
        //    pedelay = 1000;
        //}

        var imageformat = "png"; //default
        if (req.body.imageformat) {
            imageformat = req.body.imageformat;
        }

        var viewportheight = 800; //default
        if (req.body.viewportheight) {
            viewportheight = req.body.viewportheight;
        }

        var viewportwidth = 1200; //default
        if (req.body.viewportwidth) {
            viewportwidth = req.body.viewportwidth;
        }

        var format = "html"; //default
        if (req.body.format) {
            format = req.body.format;
        }

        var selector = ""; //default - nothing
        if (req.body.selector) {
            selector = req.body.selector;
        }

        var codeblock = ""; //default - nothing
        if (req.body.codeblock) {
            codeblock = req.body.codeblock;
        }

        //DO IT
        console.log("Creating Phantom Instance...");
        phantom.create(function (err, ph) {
            console.log("Creating Page Object...");
            return ph.createPage(function (err, page) {
                //set size
                console.log("Setting Page size...");
                page.set('viewportSize', { width: viewportwidth, height: viewportheight }, function (err) {

                    var resources = [];//Set up an array to hold all outgoing requests

                    //Setup Resource Listeners
                    page.onResourceRequested = function (request) {
                        resources[request.id] = request.stage;
                        console.log("outgoing request sent.");
                    };

                    //When a resource has been recieved, remove it from the list
                    page.onResourceReceived = function (request) {
                        resources[request.id] = request.stage;
                        console.log("outgoing response recieved.");
                    };


                    console.log("Opening Page...");
                    return page.open(url, function (status) {
                        console.log("Opened Page...");

                        //Let page render before continuing
                        //setTimeout(function () {
                            console.log("inside of settimeout");
                            page.onConsoleMessage = function (msg) { console.log(msg); };
                            return page.evaluate(function (args) {

                                console.log("Codeblock: " + args.codeblock);
                                console.log("Evaluating js...");
                                console.log("selector: " + args.selector);
                                console.log("args: " + args);
                                var result = {  };

                                //Execute any pre-rendering javascript here
                                if (args.codeblock) {
                                    console.log("About to execute pre-render logic.");
                                    var preFunk;
                                    try {
                                        preFunk = (new Function("return function() {" + args.codeblock + "};"))();
                                        preFunk();
                                    } catch (e) {
                                        console.log("error executing code block: " + e.message);
                                    }
                                    console.log("Executed pre-render logic.");
                                }

                                if (args.selector) {
                                    console.log("Getting clip extent");

                                    var clipRect = document.querySelector(args.selector).getBoundingClientRect();
                                    console.log(clipRect);
                                    result.clipRect = clipRect;
                                    return result;
                                }
                                else {
                                    return result;
                                }

                            }, function (err, result) {
                                //Callback for page.evaluate
                                //this is being called too quickly.  add delay

                                setTimeout(function () {

                                    console.log("about to synch outgoing and incoming requests.");

                                    //Keep an eye on all of the outgoing resource requests.
                                    //When they all are complete, then move on.
                                    waitFor(function () {
                                        // See if all outgoing requests have completed
                                        for (var i = 1; i < resources.length; ++i) {
                                            console.log(resources[i]);
                                            if (!resources[i] || resources[i] != 'end') {
                                                console.log("outgoing requests still pending.");
                                                return false;
                                            }
                                        }
                                        console.log("outgoing requests all complete, moving on.");

                                        return true;
                                    }, function () {
                                        //Callback for when all initial pageload resource requests have ended.


                                        var outputURL = req.protocol + "://" + req.get('host') + "/output/";
                                        //var outputURL = "http://services.spatialdev.com/output/";
                                        var filename = 'phantomoutput' + shortId.generate() + '.' + imageformat;
                                        if (result && result.clipRect) {
                                            //Clip
                                            page.set('clipRect', { width: result.clipRect.width, height: result.clipRect.height, top: result.clipRect.top, left: result.clipRect.left }, function (err) {
                                                return page.render('output/' + filename, function () {
                                                    console.log('Page Rendered - ' + (err || result));
                                                    ph.exit();
                                                    //Render
                                                    if (format == "html") {
                                                        res.render('print', { imageLink: filename, errorMessage: err, imageformat: req.body.imageformat, format: req.body.format, viewportwidth: req.body.viewportwidth, viewportheight: req.body.viewportheight, url: req.body.url, selector: req.body.selector, codeblock: req.body.codeblock, breadcrumbs: [{ link: "/print", name: "Home" }, { link: "", name: "Print" }] })
                                                    }
                                                    else if (format == "json") {
                                                        //Respond with JSON
                                                        //res.header("Content-Type:", "application/json");
                                                        res.writeHead(200, { 'content-type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                                                        res.end(JSON.stringify({ image: outputURL + filename }));
                                                    }
                                                });
                                            });
                                        }
                                        else {
                                            //Don't clip         
                                            console.log("about to render page:");
                                            return page.render('output/' + filename, function () {
                                                console.log('Page Rendered.');
                                                ph.exit();
                                                //Render
                                                if (format == "html") {

                                                    res.render('print', { imageLink: filename, errorMessage: err, imageformat: req.body.imageformat, format: req.body.format, viewportwidth: req.body.viewportwidth, viewportheight: req.body.viewportheight, url: req.body.url, selector: req.body.selector, codeblock: req.body.codeblock, breadcrumbs: [{ link: "/print", name: "Home" }, { link: "", name: "Print" }] })
                                                }
                                                else if (format == "json") {
                                                    //Respond with JSON
                                                    //res.header("Content-Type:", "application/json");
                                                    res.writeHead(200, { 'content-type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                                                    res.end(JSON.stringify({ image: outputURL + filename }));
                                                }
                                            });
                                        }
                                        //},pedelay); //wait a sec before executing any pre-code stuff.


                                    }, 15000); //The Timeout milliseconds.  After this, give up and move on


                                }, 1000); //Built in delay to let the execution block have a chance to send out requests.


                            }, { codeblock: codeblock, selector: selector }); //arguments to be passed to page.evaluate

                        //}, delay);
                    });
                });
            });
        });
    }
    else {
        //Render Query Form without any results.
        res.render('print', { breadcrumbs: [{ link: "/print", name: "Home" }, { link: "", name: "Print" }] });
    }

};





//Define Paths
//Root Request - redirect to print
app.get('/', function (req, res) { res.redirect('/print') });

//Print API
app.get('/print', routes['print']);

//Post Options
app.post('/print', routes['print']);


//create server
http.createServer(app).listen(app.get('port'), app.get('ipaddr'), function () {
    console.log('Express server listening on IP:' + app.get('ipaddr') + ', port ' + app.get('port'));
});


//Utilities

//Determine if a string contains all numbers.
function IsNumeric(sText) {
    var ValidChars = "0123456789";
    var IsNumber = true;
    var Char;
    sText.replace(/\s+/g, '')

    for (i = 0; i < sText.length && IsNumber == true; i++) {
        Char = sText.charAt(i);
        if (ValidChars.indexOf(Char) == -1) {
            IsNumber = false;
        }
    }
    return IsNumber;
}


/**
 * See https://github.com/ariya/phantomjs/blob/master/examples/waitfor.js
 * 
 * Wait until the test condition is true or a timeout occurs. Useful for waiting
 * on a server response or for a ui change (fadeIn, etc.) to occur.
 *
 * @param testFx javascript condition that evaluates to a boolean,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param onReady what to do when testFx condition is fulfilled,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param timeOutMillis the max amount of time to wait. If not specified, 3 sec is used.
 */
function waitFor(testFx, onReady, timeOutMillis) {
    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000, //< Default Max Timout is 3s
        start = new Date().getTime(),
        condition = (typeof (testFx) === "string" ? eval(testFx) : testFx()), //< defensive code
        interval = setInterval(function () {
            if ((new Date().getTime() - start < maxtimeOutMillis) && !condition) {
                // If not time-out yet and condition not yet fulfilled
                condition = (typeof (testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
            } else {
                if (!condition) {
                    // If condition still not fulfilled (timeout but condition is 'false')
                    console.log("'waitFor()' timeout");
                    ph.exit(1);
                } else {
                    // Condition fulfilled (timeout and/or condition is 'true')
                    console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                    typeof (onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
                    clearInterval(interval); //< Stop this interval
                }
            }
        }, 250); //< repeat check every 250ms
};