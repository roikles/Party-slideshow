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

var feed = "http://ffffound.com/feed?offset=50";
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
    // This is where the action is!
    var stream = this; // `this` is `feedparser`, which is a stream
    var item;

    while (item = stream.read()) {
        //console.log(item);
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

    let v = new vibrant(url);
    v.getSwatches(function(err, swatch) {
        if (err) {
            console.log(err);
        } else {
            let darkVibrant = swatch.DarkVibrant.rgb;
            /*let lightVibrant = swatch.LightVibrant.rgb;
            let darkMuted = swatch.DarkMuted.rgb;
            let lightMuted = swatch.LightMuted.rgb;
            let muted = swatch.Muted.rgb;
            let vibrant = swatch.Vibrant.rgb;*/

            jquery('.slider').slick('slickAdd',"<div><div class='slide-wrapper'>" + img + "</div></div>");

            //let wrapper = document.querySelectorAll('body');

            //document.querySelectorAll('.slide-wrapper').style.background = 'background-image(linear-gradient(rgba('+ darkVibrant[0] +','+ darkVibrant[1] +','+ darkVibrant[2] +',0), rgba(255,0,0,0)))';
            //wrapper.style.background = 'background-image(linear-gradient(rgba(0,0,0,1), rgba(255,0,0,1)))';
        }
    })

   
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
    let validExtensions = ['jpg','jpeg','gif','png'];
    
    // Read the file directory and loop through all files
    fs.readdir(folder, (err, files) => {
        files.forEach(file => {
            
            // Get extension for each file
            let extension = file.split('.').pop();
            
            // Make sure extension is in the validExtensions array
            if (validExtensions.indexOf(extension) !== -1) {
                createImage('./' + folder + '/' + file);
            }
  
        });
    });

    console.log('getImages done');
}



function initSlider(){

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

    getImages('imgcache');

}

initSlider();
