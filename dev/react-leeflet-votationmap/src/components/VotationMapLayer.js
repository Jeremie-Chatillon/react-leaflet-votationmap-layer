
import { MapLayer, withLeaflet } from 'react-leaflet';
import L from 'leaflet';
import React from 'react';
import PropTypes from 'prop-types';

/*
import map from 'lodash.map';
import reduce from 'lodash.reduce';
import filter from 'lodash.filter';
import min from 'lodash.min';
import max from 'lodash.max';
*/

const VotationLayers = require('./VotationLayer.js');
var VotationLayer = VotationLayers._test.VotationLayer;

function safeRemoveLayer(leafletMap, el) {
  const { overlayPane } = leafletMap.getPanes();
  if (overlayPane && overlayPane.contains(el)) {
    overlayPane.removeChild(el);
  }
}
/*
export type LeafletZoomEvent = {
  zoom: number;
  center: Object;
}
*/

export default withLeaflet(class VotationMapLayer extends MapLayer {

  componentDidMount() {

    const canAnimate = this.props.leaflet.map.options.zoomAnimation && L.Browser.any3d;
    const zoomClass = `leaflet-zoom-${canAnimate ? 'animated' : 'hide'}`;
    const mapSize = this.props.leaflet.map.getSize();
    const transformProp = L.DomUtil.testProp(
      ['transformOrigin', 'WebkitTransformOrigin', 'msTransformOrigin']
    );


    this._el = L.DomUtil.create('canvas', zoomClass);
    this._el.style[transformProp] = '50% 50%';
    this._el.width = mapSize.x;
    this._el.height = mapSize.y;


    const el = this._el;

    const Heatmap = L.Layer.extend({
      onAdd: (leafletMap) => leafletMap.getPanes().overlayPane.appendChild(el),
      addTo: (leafletMap) => {
        leafletMap.addLayer(this);
        return this;
      },
      onRemove: (leafletMap) => safeRemoveLayer(leafletMap, el)
    });

    this.leafletElement = new Heatmap();
    super.componentDidMount();
    this._heatmap = new VotationLayer(this._el);
    this.redraw();

    //this.updateHeatmapProps(this.getHeatmapProps(this.props));
  };

  createLeafletElement() {
    return null;
  }


  redraw() {

    const maxZoom = 15;

    const r = this._heatmap._r;
    const size = this.props.leaflet.map.getSize();
    //console.info("size", size)

    const cellSize = r / 2;
    const panePos = this.props.leaflet.map._getMapPanePos();
    const offsetX = panePos.x % cellSize;
    const offsetY = panePos.y % cellSize;

    const inBounds = (p, bounds) => bounds.contains(p);

    const v = 1 / Math.pow(
      2,
      Math.max(0, Math.min(maxZoom - this.props.leaflet.map.getZoom(), 12)) / 2
    );

    /*
    const accumulateInGrid = (points, leafletMap, bounds) => reduce(points, (grid, point) => {
      const latLng = [point.x ,point.x];
      
      /*if (isInvalidLatLngArray(latLng)) { //skip invalid points
        return grid;
      }

      const p = leafletMap.latLngToContainerPoint(latLng);

      if (!inBounds(p, bounds)) {
        return grid;
      }

      const x = Math.floor((p.x - offsetX) / cellSize) + 2;
      const y = Math.floor((p.y - offsetY) / cellSize) + 2;

      grid[y] = grid[y] || [];
      const cell = grid[y][x];

      const alt = point.v;
      const k = alt * v;

      if (!cell) {
        grid[y][x] = [p.x, p.y, k, 1];
      } else {
        cell[0] = (cell[0] * cell[2] + p.x * k) / (cell[2] + k); // x
        cell[1] = (cell[1] * cell[2] + p.y * k) / (cell[2] + k); // y
        cell[2] += k; // accumulated intensity value
        cell[3] += 1;
      }

      return grid;
    }, []);
    */

    //const getBounds = () => new L.Bounds(L.point([-r, -r]), size.add([r, r]));

    /*
    const getDataForHeatmap = (points, leafletMap) => roundResults(
      accumulateInGrid(
        points,
        leafletMap,
        getBounds(leafletMap)
      )
    );
    */

    const datas = this.transformeData();


    this._heatmap.addData(datas);
    this._heatmap._opacity = 100;
    this._heatmap._radius = 30
    this._heatmap.redraw();


  }


  // https://stackoverflow.com/questions/6172355/how-to-convert-lat-long-to-an-xy-coordinate-system-e-g-utm-and-then-map-this
  transformeData() {

    const width = this._el.width;
    const height = this._el.height
 
    const bounds = this.props.leaflet.map.getBounds();
    console.info("bounds", bounds)
    const east = bounds.getEast();
    const west = bounds.getWest();
    const north = bounds.getNorth();
    const south = bounds.getSouth();

    console.info(east)

    const lonDelta = west-east;
    const latDelta = north-south;

    console.info(lonDelta, latDelta)
    console.info(width, height);
    
    const tmp = this.props.points.map(d => {
      /*
      const ltlg =L.latLng(d.x, d.y)

      const xy = this.props.leaflet.map.project(ltlg);
      console.info(ltlg)
      console.info(this.props.leaflet.map.project(ltlg));

      //console.info(L.project(L.latLng(d.x, d.y)))
      /*
      return {
        x: Math.floor((width) * (180 + d.x) / 360),
        y: Math.floor((height) * (90 - d.y) / 180),
        v: d.v
      }
*/
      
      const x = Math.floor(((east - d.x) / lonDelta) * width)
      const y = Math.floor(((west - d.y) / latDelta) * height)
      console.info(x, y);
      return {
        x: Math.floor(x),
        y: Math.floor(y),
        v: d.v
      }
    });


    console.info(width, height, tmp);

    return tmp;

  };
  /*
    _animateZoom(e: LeafletZoomEvent): void {
      const scale = this.props.leaflet.map.getZoomScale(e.zoom);
      const offset = this.props.leaflet.map
                        ._getCenterOffset(e.center)
                        ._multiplyBy(-scale)
                        .subtract(this.props.leaflet.map._getMapPanePos());
  
      if (L.DomUtil.setTransform) {
        L.DomUtil.setTransform(this._el, offset, scale);
      } else {
        this._el.style[L.DomUtil.TRANSFORM] =
            `${L.DomUtil.getTranslateString(offset)} scale(${scale})`;
      }
    }
  
    static propTypes = {
      gradient: PropTypes.object
    };
  */

  render() {
    return (
      null
    );
  }
});