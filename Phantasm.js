
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

        var delay = 1000;
        if (req.body.delay) {
            delay = req.body.delay;
            if (IsNumeric(delay)) {
                delay = parseInt(delay);
            }
            else {
                delay = 1000;
                req.params.infoMessage = "Delay was non-numeric.  Defaulting to 1000 ms";
            }
        }
        else {
            delay = 1000;
        }

        var pedelay = 1000;
        if (req.body.pedelay) {
            pedelay = req.body.pedelay;
            if (IsNumeric(pedelay)) {
                pedelay = parseInt(pedelay);
            }
            else {
                pedelay = 1000;
                req.params.infoMessage = "Pre-execution delay was non-numeric.  Defaulting to 1000 ms";
            }
        }
        else {
            pedelay = 1000;
        }

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
                    console.log("Opening Page...");
                    return page.open(url, function (status) {
                        console.log("Opened Page...");

                        //Let page render before continuing
                        setTimeout(function () {
                            console.log("inside of settimeout");
                            page.onConsoleMessage = function (msg) { console.log(msg); };
                            return page.evaluate(function (args) {

                                console.log("Codeblock: " + args.codeblock);
                                console.log("Evaluating js...");
                                console.log("selector: " + args.selector);
                                console.log("args: " + args);
                                var result = { delay: 50 };

                                //Execute any pre-rendering javascript here
                                if (args.codeblock) {
                                    console.log("About to execute pre-render logic.");
                                    var preFunk;
                                    try {
                                        preFunk = (new Function("return function() {" + args.codeblock + "};"))();
                                        console.log(preFunk);
                                        preFunk();
                                    } catch (e) {
                                        console.log("error executing code block: " + e.message);
                                    }
                                    result.delay = pedelay;// Up the wait time to make sure this block has time to execute.  Might want to expose this to API
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
                                setTimeout(function () {
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
                                                    res.render('print', { imageLink: filekname, errorMessage: err, imageformat: req.body.imageformat,pedelay:req.body.pedelay, format: req.body.format, url: req.body.url, delay: req.body.delay, selector: req.body.selector, codeblock: req.body.codeblock, breadcrumbs: [{ link: "/print", name: "Home" }, { link: "", name: "Print" }] })
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
                                        return page.render('output/' + filename, function () {
                                            console.log('Page Rendered.');
                                            ph.exit();
                                            //Render
                                            if (format == "html") {

                                                res.render('print', { imageLink: filename, errorMessage: err, imageformat: req.body.imageformat,pedelay: req.body.pedelay, format: req.body.format, url: req.body.url, delay: req.body.delay, selector: req.body.selector, codeblock: req.body.codeblock, breadcrumbs: [{ link: "/print", name: "Home" }, { link: "", name: "Print" }] })
                                            }
                                            else if (format == "json") {
                                                //Respond with JSON
                                                //res.header("Content-Type:", "application/json");
                                                res.writeHead(200, { 'content-type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                                                res.end(JSON.stringify({ image: outputURL + filename }));
                                            }
                                        });
                                    }
                                },pedelay); //wait a sec before executing any pre-code stuff.


                            }, { codeblock: codeblock, selector: selector }); //arguments to be passed to page.evaluate

                        }, delay);
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
