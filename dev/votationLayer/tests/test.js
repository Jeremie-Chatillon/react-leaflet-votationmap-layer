
var assert = require('assert');
var expect = require('chai').expect;
var should = require('chai').should();

const jsdom = require("jsdom");
const { JSDOM } = jsdom;


var VotationLayer = require('../VotationLayer.js');


const {document} = (new JSDOM(`
<!DOCTYPE html>
<html>

<head>
    <title>Votation Layer demo</title>
</head>
<body>
    <div>
        <canvas id="canvas" width="1000" height="600"></canvas>
    </div>
</body>
</html>
`)).window;


//console.info("cv", document.getElementById('canvas'));

var votationLayer = new VotationLayer(document.getElementById('canvas'));

describe('VotationLayer color transformation Test', function () {

    it('htmlColorToRGB', function () {
        const rgbColor = votationLayer.htmlColorToRGB('#FF0000');
        rgbColor.should.have.property('r').which.is.equal(255);
        rgbColor.should.have.property('g').which.is.equal(0);
        rgbColor.should.have.property('b').which.is.equal(0);
    });

    it('rgbToHSV', function () {
        const rgbColor = {r:255, g:0, b:0};
        const hsvColor = votationLayer.rgbToHSV(rgbColor);

        hsvColor.should.have.property('h').which.is.equal(0);
        hsvColor.should.have.property('s').which.is.equal(1);
        hsvColor.should.have.property('v').which.is.equal(1);
    });

    it('rgbToHSV', function () {
        const rgbColor = {r:100, g:47, b:178};
        const hsvColor = votationLayer.rgbToHSV(rgbColor);

        hsvColor.should.have.property('h').which.is.equal(264.2748091603053);
        hsvColor.should.have.property('s').which.is.equal(0.7359550561797753);
        hsvColor.should.have.property('v').which.is.equal(0.6980392156862745);
    });

    it('HSVToRGB', function () {
        const hsvColor = {h:0, s:1, v:1};
        const rgbColor = votationLayer.HSVToRGB(hsvColor);

        rgbColor.should.have.property('r').which.is.equal(255);
        rgbColor.should.have.property('g').which.is.equal(0);
        rgbColor.should.have.property('b').which.is.equal(0);
    });


    it('#FF0000 RGB to HSV to RGB', function () {
        const rgbColor = votationLayer.htmlColorToRGB('#FF0000');
        const hsvColor = votationLayer.rgbToHSV(rgbColor);
        const rgbColor2 = votationLayer.HSVToRGB(hsvColor);

        rgbColor.should.be.equal(rgbColor);
    });

    it('#0E999E RGB to HSV to RGB', function () {
        const rgbColor = votationLayer.htmlColorToRGB('#0E999E');
        const hsvColor = votationLayer.rgbToHSV(rgbColor);
        const rgbColor2 = votationLayer.HSVToRGB(hsvColor);

        rgbColor.should.be.equal(rgbColor);
    });
});
