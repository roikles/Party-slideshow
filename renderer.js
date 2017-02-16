// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const FeedParser = require('feedparser');
const request = require('request'); 
const fs = require('fs');
const jquery = require('jquery'); 
const slick = require('slick-carousel'); 
const vibrant = require('node-vibrant');

//--

//var feed = "http://ffffound.com/feed?offset=200";
var feed = "http://ffffound.com/home/osmangranda/found/feed?offset=200";
var feedData = [];

// action this request again in orderr to repeat
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
    var stream = this;
    var item;

    while (item = stream.read()) {
        feedData.push(item.image.url);
    }
});

/**
 * Just use this to get the data
 */

feedparser.on('end', function() {

    // Loop through each of the returned images from
    // the supplied URL
    for (let i = 0; i < feedData.length; i++) {
        
        let url = feedData[i]
            .replace('_s.jpg','_m.jpg')
            .replace('_s.jpeg','_m.jpeg')
            .replace('_s.png','_m.png')
            .replace('_s.gif','_m.gif');
        let filename = url.replace('http://img-thumb.ffffound.com/static-data/assets/','').replace('/','-');
        let path = './imgcache/' + filename;

        if (!fs.existsSync(path)) {
            request(url, {encoding: 'binary'}, function(error, response, body) {
                fs.writeFile(path, body, 'binary', function (err) {
                    //console.log(err);
                });
            });
        }
    }

});


/**
 * createImage
 *
 * Creates an image from a url and injects it into the slider
 */
function createImage(url){
    let img = '<img src="' + url + '">';
        img.className = 'slider-img';

    //console.log(img);
    //console.log(url);
    //let v = new vibrant(url);

    vibrant.from(url).getPalette(function(err, swatches) {
        if (err) throw err;
        console.log(swatches);
        let darkMuted = swatches.DarkMuted.rgb;
        let darkVibrant = swatches.DarkVibrant.rgb;
        //let lightMuted = swatches.LightMuted.rgb;
        //let lightVibrant = swatches.LightVibrant.rgb;
        let muted = swatches.Muted.rgb;
        let vibrant = swatches.Vibrant.rgb;

        for (var key in swatches) {
          var swatch = swatches[key];
          //console.log(swatch);
          if (swatch) {
            var rgb = swatch.getRgb();
        //    console.log(key + ": " + rgb);

          }
        }
        jquery('.slider').slick('slickAdd',"<div><div class='slide-wrapper' style='background-image: linear-gradient(rgba(" + darkVibrant + ",0.5),rgba(" + vibrant + ",0.5),rgba(" + muted + ",0.5));'>" + img + "</div></div>");
    });   
}


/**
 * getImages
 *
 * Loads an array of filenames from the cache directory
 * and makes sure the extension is valid. 
 * Valid image urls are then run through the createImage 
 * function.
 * 
 * @return {[type]} [description]
 */
function getImages(folder){
    let validExtensions = ['jpg','jpeg','png'];
    
    // Read the file directory and loop through all files
    fs.readdir(folder, (err, files) => {
        files.forEach(file => {
            
            // Get extension for each file
            let extension = file.split('.').pop();
            
            // Make sure extension is in the validExtensions array
            if (validExtensions.indexOf(extension) !== -1) {
                createImage(folder + '/' + file);
            }
  
        });
    });

    console.log('getImages done');
}



function initSlider(){

    jquery('.slider').slick({
        dots: false,
        infinite: true,
        speed: 1000,
        fade: true,
        cssEase: 'linear',
        autoplay: true,
        autoplaySpeed: 5000,
        pauseOnHover: false
    });

    getImages('imgcache');

}

initSlider();
