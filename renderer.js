// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const FeedParser = require('feedparser');
const request = require('request'); 

var feed="http://ffffound.com/feed?offset=0";
var feedData = [];

var req = request(feed);
var feedparser = new FeedParser();

req.on('error', function (error) {
    // handle any request errors
    console.log(error);
});

req.on('response', function (res) {
    var stream = this; // `this` is `req`, which is a stream

    if (res.statusCode !== 200) {
        this.emit('error', new Error('Bad status code'));
    } else {
        stream.pipe(feedparser);
    }
});

feedparser.on('error', function (error) {
    console.log(error);
});

feedparser.on('readable', function () {
    // This is where the action is!
    var stream = this; // `this` is `feedparser`, which is a stream
    var meta = this.meta; // **NOTE** the "meta" is always available in the context of the feedparser instance
    var item;

    while (item = stream.read()) {
        console.log(item);
        feedData.push(item.summary);
    }
});

feedparser.on('end', function() {
    console.log(feedData.length);

    for (let i = 1; i < feedData.length; i++) {
        let myApp = document.getElementById('app');
        let div = document.createElement("div");
        div.class = 'img-' + i;
        div.innerHTML = feedData[i];

        myApp.appendChild(div);
        console.log(feedData[i]);
    }
});




//console.log(feedData);
