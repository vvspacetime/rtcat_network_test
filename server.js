var serve = require('koa-static');
var koa = require('koa');
var app = new koa();
var fs = require('fs');
var http = require('http');
var https = require('https');
var enforceHttps = require('koa-sslify');
var os = require('os');
var path = require('path');
var koaBody = require('koa-body');
var logger = require('koa-logger');
var mkdirp = require('mkdirp');

app.use(logger());
app.use(koaBody({ multipart: true }));
app.use(enforceHttps());
app.use(serve('web'));

app.use(function(ctx, next) {
    // ignore non-POSTs
    if ('POST' != ctx.method) return next();

    const file = ctx.request.body.files.file;
    const reader = fs.createReadStream(file.path);
    const url = decodeURI(ctx.request.url);
    const dir = "." + url;

    if (!fs.existsSync(dir)){
        mkdirp.sync(dir);
    }

    const stream = fs.createWriteStream(dir + "/" + file.name);

    reader.pipe(stream);

    console.log('uploading %s', stream.path);

    ctx.body = 'success';
});




var config = require("./config.json");

var options = {
    key: fs.readFileSync(config.key),
    cert: fs.readFileSync(config.cert)
};

https.createServer(options, app.callback()).listen(config.port);

console.log('listening on port :',config.port);