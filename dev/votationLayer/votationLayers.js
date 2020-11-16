'use strict';

if (typeof module !== 'undefined') module.exports = votationLayers;

function votationLayers(canvas) {
    if (!(this instanceof votationLayers)) return new votationLayers(canvas);

    this._canvas = canvas = typeof canvas === 'string' ? document.getElementById(canvas) : canvas;

    this._ctx = canvas.getContext('2d');
    this._width = canvas.width;
    this._height = canvas.height;

    this._imagedata = this.resetImageData();




    this._opacity = 100;
    this._radius = 60; 
    this._gradient = []; 
    

    
    //console.info("contructor2", this._gradient);

    this._maxVoation = 5;
    this._data = [];

}

votationLayers.prototype = {
    defaultRadius: 25,

    max: function (max) {
        this._max = max;
        return this;
    },

    radius: function (r, blur) {
        blur = blur === undefined ? 15 : blur;

        // create a grayscale blurred circle image that we'll use for drawing points
        var circle = this._circle = this._createCanvas(),
            ctx = circle.getContext('2d'),
            r2 = this._r = r + blur;

        circle.width = circle.height = r2 * 2;

        ctx.shadowOffsetX = ctx.shadowOffsetY = r2 * 2;
        ctx.shadowBlur = blur;
        ctx.shadowColor = 'black';

        ctx.beginPath();
        ctx.arc(-r2, -r2, r, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();

        return this;
    },

    resetImageData: function() {
        this._imagedata = this._ctx.createImageData(this._width, this._height);
    },

    draw: function () {
        this.resetImageData();

        this._data.map(d => 
            this.drawCricle(d.x, d.y, d.v)
        );

        this._ctx.putImageData(this._imagedata, 0, 0);

    },


    addData: function(data) {
        

        data.map( d => {
            this._data.push(d)
        });

        console.info("dta", this._data[0].x);
    },

    setColor: function(color) {
        
    },

    


    /**
     * 
     * @param {*} startColor 
     * @param {*} endColor 
     * 
     * https://www.experts-exchange.com/questions/20748554/I-need-to-calculate-a-rgb-gradient-color.html
     */
    rgbGradiant: function(startColor, endColor) {

        const startColorDecimal = this.colorExtractor(startColor);
        const endColorDecimal = this.colorExtractor(endColor);

        console.info(startColorDecimal)
        this._gradient = [this._maxVoation];


        for(var i = 0; i < this._maxVoation; ++i){
            const red = startColorDecimal[0]    + (i * (endColorDecimal[0] - startColorDecimal[0]) / (this._maxVoation -1));
            const green = startColorDecimal[1]    + (i * (endColorDecimal[1] - startColorDecimal[1]) / (this._maxVoation -1));
            const blue = startColorDecimal[2]    + (i * (endColorDecimal[2] - startColorDecimal[2]) / (this._maxVoation -1));

            this._gradient[i] = [red, green, blue];
        }
        
        console.info("rgbGradiant", this._gradient);
    },


    colorExtractor: function(color) {
        // Check that it is a HTML RGB color (#RRGGBB)
        this.assertError(color[0] === "#" && color.length === 7, "Error, unvalid parameter in colorExtractor");

        const red = parseInt(color[1] + color[2] , 16);
        const green = parseInt(color[3] + color[4] , 16);
        const blue = parseInt(color[5] + color[6] , 16);

        console.info(red, green, blue);
        return([red, green, blue]);
    },


    drawCricle: function (x, y, v) {

        //var imagedata = this._ctx.createImageData(this._width, this._height);
        const height = this._height;
        const width = this._width;
        const opacity = this._opacity;

        const radius = this._radius;

        const offset = 10;

        for (var i = -radius; i <= radius; i++) {
            for (var j = -radius; j <= radius; j++) {
                var pixelindex = (x - i * width + y - j) * 4;
                
                if (j * j + i * i <= radius * radius) {
                    var pixelindex = (x - i * width + y*width - j) * 4;
                
                    // Set the pixel data
                    this._imagedata.data[pixelindex] = this._gradient[v][0];     // Red
                    this._imagedata.data[pixelindex + 1] = this._gradient[v][1]; // Green
                    this._imagedata.data[pixelindex + 2] = this._gradient[v][2];  // Blue
                    this._imagedata.data[pixelindex + 3] = opacity;   // Alpha
                }
            }
        }
        //this._ctx.putImageData(imagedata, 0, 0);
    },



    à : function() {
        this.resetImageData();

        const values = this.computeData();
        
        for (var key in values){
            const index = key * 4;

            // Résutat de la moyenne des votations.
            // Arrondit pour avoir la couleur reférente.
            // -1 car les votations sont définite de [1;n]
            const color = Math.round(values[key].sum/values[key].count) - 1;            

            this._imagedata.data[index] = this._gradient[color][0];        // Red
            this._imagedata.data[index + 1] = this._gradient[color][1];    // Green
            this._imagedata.data[index + 2] = this._gradient[color][2];    // Blue
            this._imagedata.data[index + 3] = this._opacity;                     // Alpha
        };


        this._ctx.putImageData(this._imagedata, 0, 0);
    },


    computeData: function() {

        const radius = this._radius;
        const width = this._width;

        var values = {};
        
        console.info("computeData d: ", this._data);
        this._data.map(d => {
            for (var i = -radius; i <= radius; i++) {
                for (var j = -radius; j <= radius; j++) {
                    
                    // TODO: Traiter les cas limites (bords)
                    if (j * j + i * i <= radius * radius) {
                        var pixelindex = (d.x - i + (d.y - j) * width);

                        if(!values[pixelindex]){
                            values[pixelindex] = {sum: d.v, count: 1};
                        } else {
                            values[pixelindex] = {sum: d.v + values[pixelindex].sum, count: 1 + values[pixelindex].count}
                        }
                    }
                }
            }
        })

        return values;
    },

    /**
     * Assertion control
     * @param {*} cond condition to be respected
     * @param {*} errorMessage Error mesage throw
     * 
     * https://stackoverflow.com/questions/15313418/what-is-assert-in-javascript
     */
    assertError: function(cond, errorMessage) {
        if (!cond) {
            errorMessage = errorMessage || "Assertion failed";
            if (typeof Error !== "undefined") {
                throw new Error(errorMessage);
            }
            throw errorMessage; // Fallback
        }
    },

    _createCanvas: function () {
        if (typeof document !== 'undefined') {
            return document.createElement('canvas');
        } else {
            // create a new canvas instance in node.js
            // the canvas class needs to have a default constructor without any parameter
            return new this._canvas.constructor();
        }
    },


}
