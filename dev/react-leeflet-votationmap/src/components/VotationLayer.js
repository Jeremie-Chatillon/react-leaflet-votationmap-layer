//'use strict';

//export default class VotationLayer {
  class VotationLayer {
    constructor(canvas) {
      this._canvas = canvas = typeof canvas === 'string' ? document.getElementById(canvas) : canvas;
  
      this._ctx = canvas.getContext('2d');
      this._width = canvas.width;
      this._height = canvas.height;
  
      this._opacity = 255;
      this._radius = 100;
  
      this._maxVoation = 5;
      this._data = [];
  
      this.setColor('#FF0000', '#00FF00')
  
  
      this.resetImageData();
  
      this.colorCalculator = this.uniqueHSVGradient;
  
    }
  
    resetImageData() {
      this._imagedata = this._ctx.createImageData(this._width, this._height);
    }
  
    setData(datas) {
      this._data = []
      datas.map(d => {
        this._data.push({x:d[0], y:d[1], v:d[2]})
      });
      return this;
    }
  
    clear(){
      this._data = []
    }
  
    addData(datas) {
      datas.map(d => {
        this._data.push(d)
      });
    }
  
    setOpacity(opacity) {
      this._opacity = opacity;
    }
  
    setRadius(radius) {
      this._radius = radius
    }
  
  
    setRGBGradiant() {
      this.colorCalculator = this.uniqueRGBGradient
    }
  
  
    setHSVGradiant() {
      this.colorCalculator = this.uniqueHSVGradient
    }
  
    setHSVInvertGradiant() {
      this.colorCalculator = this.uniqueHSVInvertedGradient
    }
  
    setColor(startColor, endColor) {
      this._startColor = startColor;
      this._endColor = endColor;
  
      this._startColorRGB = this.htmlColorToRGB(this._startColor);
      this._endColorRGB = this.htmlColorToRGB(this._endColor);
  
      this._startColorHSV = this.rgbToHSV(this._startColorRGB);
      this._endColorHSV = this.rgbToHSV(this._endColorRGB);
  
      this._delta = (this._endColorHSV.h - this._startColorHSV.h + 360) % 360;
    }
  
    uniqueRGBGradient(value) {
      const startColorDecimal = this.htmlColorToRGB(this._startColor);
      const endColorDecimal = this.htmlColorToRGB(this._endColor);
  
      const red = startColorDecimal.r + (value * (endColorDecimal.r - startColorDecimal.r));
      const green = startColorDecimal.g + (value * (endColorDecimal.g - startColorDecimal.g));
      const blue = startColorDecimal.b + (value * (endColorDecimal.b - startColorDecimal.b));
  
      return { r: red, g: green, b: blue };
    }
  
    // https://www.rapidtables.com/convert/color/rgb-to-hsv.html
    rgbToHSV(rgbColor) {
      const rPrim = rgbColor.r.toFixed(2) / 255.0;
      const gPrim = rgbColor.g.toFixed(2) / 255.0;
      const bPrim = rgbColor.b.toFixed(2) / 255.0;
  
      const cMax = Math.max(rPrim, gPrim, bPrim);
      const cMin = Math.min(rPrim, gPrim, bPrim);
  
      const delta = cMax - cMin;
  
      var hue = 0.0;
      // Calcul de la teinte H(Hue)
      if (delta === 0)
        hue = 0.0;
      else if (cMax === rPrim)
        hue = 60 * ((gPrim - bPrim) / delta % 6)
      else if (cMax === gPrim)
        hue = 60 * ((bPrim - rPrim) / delta + 2)
      else
        hue = 60 * ((rPrim - gPrim) / delta + 4)
  
      // Calcul de la saturation S
      var saturation = 0.0;
      if (cMax !== 0.0)
        saturation = delta / cMax;
  
      var velorcity = cMax;
  
      return { h: hue, s: saturation, v: velorcity };
    }
  
    HSVToRGB(color) {
      const h = color.h;
  
      const c = color.v * color.s;
      const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
      const m = color.v - c;
  
      var rgbColorPrim = {};
  
      if (h < 60)
        rgbColorPrim = { r: c, g: x, b: 0 }
      else if (h < 120)
        rgbColorPrim = { r: x, g: c, b: 0 }
      else if (h < 180)
        rgbColorPrim = { r: 0, g: c, b: x }
      else if (h < 240)
        rgbColorPrim = { r: 0, g: x, b: c }
      else if (h < 300)
        rgbColorPrim = { r: x, g: 0, b: c }
      else
        rgbColorPrim = { r: c, g: 0, b: x }
  
      const r = Math.round((rgbColorPrim.r + m) * 255);
      const g = Math.round((rgbColorPrim.g + m) * 255);
      const b = Math.round((rgbColorPrim.b + m) * 255);
  
      return { r: r, g: g, b: b };
  
    }
  
    uniqueHSVGradient(value) {
      const newH = ((this._delta * value) + this._startColorHSV.h) % 360;
  
      const HSVPrim = { h: newH, s: this._startColorHSV.s, v: this._startColorHSV.v }
  
      return this.HSVToRGB(HSVPrim);
    }
  
    uniqueHSVInvertedGradient(value) {
      const newH = (this._endColorHSV.h + ((360 - this._delta) * (1 - value))) % 360;
  
      const HSVPrim = { h: newH, s: this._startColorHSV.s, v: this._startColorHSV.v }
  
      return this.HSVToRGB(HSVPrim);
    }
  
    htmlColorToRGB(col) {
      // Check that it is a HTML RGB color (#RRGGBB)
      this.assertError(col[0] === "#" && col.length === 7, "Error, unvalid parameter in htmlColorToRGB");
  
      const red = parseInt(col[1] + col[2], 16);
      const green = parseInt(col[3] + col[4], 16);
      const blue = parseInt(col[5] + col[6], 16);
  
      return { r: red, g: green, b: blue };
    }
  
    redraw() {
      this.resetImageData();
  
  
      const values = this.computeData();
  
      for (var key in values) {
        // Résutat de la moyenne des votations.
        // -1 car les votations sont définite de [1;n] => on obtient de [0;n-1]
        // Divisé par le nombre de votations pour avoir un nombre normalisé entr [0;1]
        const nValue = ((values[key].sum / values[key].count) - 1) / this._maxVoation;
  
        // Récupère la couleur résultante à la votation
        const colors = this.colorCalculator(nValue);
  
        // application de la couleur RGB sur le bon pixel.
        const index = key * 4;
        this._imagedata.data[index] = colors.r;        // Red
        this._imagedata.data[index + 1] = colors.g;    // Green
        this._imagedata.data[index + 2] = colors.b;    // Blue
        this._imagedata.data[index + 3] = this._opacity;               // Alpha
      }
      const index = 999 * 4;
      this._imagedata.data[index] = 0;        // Red
      this._imagedata.data[index + 1] = 0;    // Green
      this._imagedata.data[index + 2] = 0;    // Blue
      this._imagedata.data[index + 3] = 255;
  
      this._ctx.putImageData(this._imagedata, 0, 0);
  
    }
  
    computeData() {
      const radius = this._radius;
      const width = this._width;
      const height = this._height;
  
      var values = {};
  
      this._data.map(d => {
        for (var i = -radius; i <= radius; i++) {
          for (var j = -radius; j <= radius; j++) {
  
            const xInd = d.x - i;
            const yInd = d.y - j;
  
            // Condition pour ne pas dépasser les limites du canvas
            if (!(xInd < 0 || xInd >= width || yInd < 0 || yInd >= height)) {
              // Condition pour faire un rond
              if (j * j + i * i <= radius * radius) {
                var pixelindex = (xInd + (yInd) * width);
  
                if (!values[pixelindex]) {
                  values[pixelindex] = { sum: d.v, count: 1 };
                } else {
                  values[pixelindex] = { sum: d.v + values[pixelindex].sum, count: 1 + values[pixelindex].count }
                }
              }
            }
          }
        }
      })
  
      return values;
    }
  
    /**
     * Assertion control
     * @param {*} cond condition to be respected
     * @param {*} errorMessage Error mesage throw
     * 
     * https://stackoverflow.com/questions/15313418/what-is-assert-in-javascript
     */
    assertError(cond, errorMessage) {
      if (!cond) {
        errorMessage = errorMessage || "Assertion failed";
        if (typeof Error !== "undefined") {
          throw new Error(errorMessage);
        }
        throw errorMessage; // Fallback
      }
    }
  
    createCanvas() {
      if (typeof document !== 'undefined') {
        return document.createElement('canvas');
      } else {
        // create a new canvas instance in node.js
        // the canvas class needs to have a default constructor without any parameter
        return new this._canvas.constructor();
      }
    }
  
  }
  
  export default VotationLayer 