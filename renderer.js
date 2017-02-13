// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const FeedParser = require('feedparser');
const request = require('request'); 
const fs = require('fs');
const jquery = require('jquery'); 
const slick = require('slick-carousel'); 
const Grade = require('grade-js');

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
    var item;

    while (item = stream.read()) {
        //console.log(item);
        feedData.push(item.image.url);
    }
});

feedparser.on('end', function() {
    //console.log(feedData);

    for (let i = 0; i < feedData.length; i++) {
        let myApp = document.getElementById('app');
        let div = document.createElement("div");
        let innerDiv = div.appendChild(document.createElement("div"));
        innerDiv.className = "gradient";
        let url = feedData[i].replace('_s.jpg','_m.jpg').replace('_s.gif','_m.gif');
        let filename = url.replace('http://img-thumb.ffffound.com/static-data/assets/','').replace('/','-');
        let path = './imgcache/' + filename;

        if (!fs.existsSync(path)) {
            request(url, {encoding: 'binary'}, function(error, response, body) {
                fs.writeFile(path, body, 'binary', function (err) {
                    console.log(err);
                });
            });
        } else {
            // See if images were skipped
            console.log('skip');
        }

        /**/

        let img = document.createElement("img");
        img.className = 'slider-img';
        img.src = path;
        innerDiv.appendChild(img);
        //let selectImg = document.querySelectorAll('.slider-img');
        //selectImg.width = "100px";
        //console.log(path);

        myApp.appendChild(div);

        if(i == feedData.length - 1){ console.log('done'); }
        //Grade(document.querySelectorAll('.gradient'));
    
        // REWRITE THIS BLOCK
        // refactor so images are loaded outside of this getter
        // cmon son...
    }

    jquery('.slider').slick({
        dots: false,
        infinite: true,
        speed: 2000,
        fade: true,
        cssEase: 'linear',
        autoplay: true,
        autoplaySpeed: 5000,
        pauseOnHover: false
    });


});



//console.log(feedData);
