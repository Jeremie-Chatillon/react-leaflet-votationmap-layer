import React from 'react';
import map from 'lodash.map';
import reduce from 'lodash.reduce';
import filter from 'lodash.filter';
import min from 'lodash.min';
import max from 'lodash.max';
import isNumber from 'lodash.isnumber';
import L from 'leaflet';
import { MapLayer, withLeaflet } from 'react-leaflet';
import simpleheat from 'simpleheat';
import PropTypes from 'prop-types';


const VotationLayers = require('./VotationLayer.js');
var VotationLayer = VotationLayers._test.VotationLayer;

export type LngLat = {
  lng: number;
  lat: number;
}

export type Point = {
  x: number;
  y: number;
}

export type Bounds = {
  contains: (latLng: LngLat) => boolean;
}

export type Pane = {
  appendChild: (element: Object) => void;
}

export type Panes = {
  overlayPane: Pane;
}

export type Map = {
  layerPointToLatLng: (lngLat: Point) => LngLat;
  latLngToLayerPoint: (lngLat: LngLat) => Point;
  on: (event: string, handler: () => void) => void;
  getBounds: () => Bounds;
  getPanes: () => Panes;
  invalidateSize: () => void;
  options: Object;
}

export type LeafletZoomEvent = {
  zoom: number;
  center: Object;
}

function isInvalid(num: number): boolean {
  return !isNumber(num) && !num;
}

function isValid(num: number): boolean {
  return !isInvalid(num);
}

function isValidLatLngArray(arr: Array<number>): boolean {
  return filter(arr, isValid).length === arr.length;
}

function isInvalidLatLngArray(arr: Array<number>): boolean {
  return !isValidLatLngArray(arr);
}

function safeRemoveLayer(leafletMap: Map, el): void {
  const { overlayPane } = leafletMap.getPanes();
  if (overlayPane && overlayPane.contains(el)) {
    overlayPane.removeChild(el);
  }
}

function shouldIgnoreLocation(loc: LngLat): boolean {
  return isInvalid(loc.lng) || isInvalid(loc.lat);
}

export default withLeaflet(class HeatmapLayer extends MapLayer {
  static propTypes = {
    points: PropTypes.array.isRequired,
    longitudeExtractor: PropTypes.func.isRequired,
    latitudeExtractor: PropTypes.func.isRequired,
    intensityExtractor: PropTypes.func.isRequired,
    fitBoundsOnLoad: PropTypes.bool,
    fitBoundsOnUpdate: PropTypes.bool,
    onStatsUpdate: PropTypes.func,
    /* props controlling heatmap generation */
    max: PropTypes.number,
    radius: PropTypes.number,
    maxZoom: PropTypes.number,
    minOpacity: PropTypes.number,
    blur: PropTypes.number,
    gradient: PropTypes.object
  };

  createLeafletElement() {
    return null;
  }

  componentDidMount(): void {
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

    var scale = L.control.scale().addTo(this.props.leaflet.map);
    //console.info("scale", scale)

    super.componentDidMount();
    this._heatmap = new VotationLayer(this._el);
    this.reset();

    if (this.props.fitBoundsOnLoad) {
      this.fitBounds();
    }
    this.attachEvents();
    this.updateHeatmapProps(this.getHeatmapProps(this.props));
  }

  getMax(props) {
    return props.max || 3.0;
  }

  getRadius(props) {
    return props.radius || 30;
  }

  getMaxZoom(props) {
    return props.maxZoom || 18;
  }

  getMinOpacity(props) {
    return props.minOpacity || 0.01;
  }

  getBlur(props) {
    return props.blur || 15;
  }

  getHeatmapProps(props) {
    return {
      minOpacity: this.getMinOpacity(props),
      maxZoom: this.getMaxZoom(props),
      radius: this.getRadius(props),
      blur: this.getBlur(props),
      max: this.getMax(props),
      gradient: props.gradient
    };
  }

  componentWillReceiveProps(nextProps: Object): void {
    const currentProps = this.props;
    const nextHeatmapProps = this.getHeatmapProps(nextProps);

    this.updateHeatmapGradient(nextHeatmapProps.gradient);

    const hasRadiusUpdated = nextHeatmapProps.radius !== currentProps.radius;
    const hasBlurUpdated = nextHeatmapProps.blur !== currentProps.blur;

    if (hasRadiusUpdated || hasBlurUpdated) {
      this.updateHeatmapRadius(nextHeatmapProps.radius, nextHeatmapProps.blur);
    }

    if (nextHeatmapProps.max !== currentProps.max) {
      this.updateHeatmapMax(nextHeatmapProps.max);
    }

  }

  /**
   * Update various heatmap properties like radius, gradient, and max
   */
  updateHeatmapProps(props: Object) {
    this.updateHeatmapRadius(props.radius, props.blur);
    this.updateHeatmapGradient(props.gradient);
    this.updateHeatmapMax(props.max);
  }

  /**
   * Update the heatmap's radius and blur (blur is optional)
   */
  updateHeatmapRadius(radius: number, blur: ?number): void {
    if (radius) {
      //this._heatmap.radius(radius, blur);
    }
  }

  /**
   * Update the heatmap's gradient
   */
  updateHeatmapGradient(gradient: Object): void {
    if (gradient) {
      //this._heatmap.gradient(gradient);
    }
  }

  /**
   * Update the heatmap's maximum
   */
  updateHeatmapMax(maximum: number): void {
    if (maximum) {
      //this._heatmap.max(maximum);
    }
  }

  componentWillUnmount(): void {
    safeRemoveLayer(this.props.leaflet.map, this._el);
  }

  fitBounds(): void {
    const points = this.props.points;
    const lngs = map(points, this.props.longitudeExtractor);
    const lats = map(points, this.props.latitudeExtractor);
    const ne = { lng: max(lngs), lat: max(lats) };
    const sw = { lng: min(lngs), lat: min(lats) };

    if (shouldIgnoreLocation(ne) || shouldIgnoreLocation(sw)) {
      return;
    }

    this.props.leaflet.map.fitBounds(L.latLngBounds(L.latLng(sw), L.latLng(ne)));
  }

  componentDidUpdate(): void {
    this.props.leaflet.map.invalidateSize();
    if (this.props.fitBoundsOnUpdate) {
      this.fitBounds();
    }
    this.reset();
  }

  shouldComponentUpdate(): boolean {
    return true;
  }

  attachEvents(): void {
    const leafletMap: Map = this.props.leaflet.map;
    leafletMap.on('viewreset', () => this.reset());
    leafletMap.on('moveend', () => this.reset());
    if (leafletMap.options.zoomAnimation && L.Browser.any3d) {
      leafletMap.on('zoomanim', this._animateZoom, this);
    }
  }


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

  reset(): void {
    const topLeft = this.props.leaflet.map.containerPointToLayerPoint([0, 0]);
    L.DomUtil.setPosition(this._el, topLeft);

    const size = this.props.leaflet.map.getSize();

    if (this._heatmap._width !== size.x) {
      this._el.width = this._heatmap._width = size.x;
    }
    if (this._heatmap._height !== size.y) {
      this._el.height = this._heatmap._height = size.y;
    }

    if (this._heatmap && !this._frame && !this.props.leaflet.map._animating) {
      this._frame = L.Util.requestAnimFrame(this.redraw, this);
    }

    this.redraw();

    //this.props.leaflet.map.setView(new L.LatLng(46.528188, 6.615687));
  }

  redraw(): void {
    const r = this._heatmap._radius;
    const size = this.props.leaflet.map.getSize();

    const maxIntensity = this.props.max === undefined
      ? 1
      : this.getMax(this.props);

    const maxZoom = this.props.maxZoom === undefined
      ? this.props.leaflet.map.getMaxZoom()
      : this.getMaxZoom(this.props);

    const v = 1 / Math.pow(
      2,
      Math.max(0, Math.min(maxZoom - this.props.leaflet.map.getZoom(), 12)) / 2
    );

    const cellSize = r / 2;
    const panePos = this.props.leaflet.map._getMapPanePos();
    const offsetX = panePos.x % cellSize;
    const offsetY = panePos.y % cellSize;
    const getLat = this.props.latitudeExtractor;
    const getLng = this.props.longitudeExtractor;
    const getIntensity = this.props.intensityExtractor;

    const inBounds = (p, bounds) => bounds.contains(p);

    const filterUndefined = (row) => filter(row, c => c !== undefined);

    const roundResults = (results) => reduce(results, (result, row) =>
      map(filterUndefined(row), (cell) => [
        Math.round(cell[0]),
        Math.round(cell[1]),
        cell[2]/cell[3],
        //cell[3]
      ]).concat(result),
      []
    );


    const accumulateInGrid = (points, leafletMap, bounds) => reduce(points, (grid, point) => {
      const latLng = [getLat(point), getLng(point)];
      if (isInvalidLatLngArray(latLng)) { //skip invalid points
        return grid;
      }

      const p = leafletMap.latLngToContainerPoint(latLng);

      if (!inBounds(p, bounds)) {
        return grid;
      }

      const x = Math.round((p.x - offsetX) / cellSize) + 2;
      const y = Math.round((p.y - offsetY) / cellSize) + 2;

      grid[y] = grid[y] || [];
      const cell = grid[y][x];

      const alt = getIntensity(point);
      //console.info(alt)
      const k = alt * v;

      if (!cell) {
        grid[y][x] = [p.x, p.y, alt, 1];
        //console.info("1")
      } else {
        //console.info(cell)
        cell[0] = (cell[0] * cell[2] + p.x * alt ) / (cell[2] + alt); // x
        cell[1] = (cell[1] * cell[2] + p.y * alt) / (cell[2] + alt); // y
        cell[2] += alt; // accumulated intensity value
        cell[3] += 1;
      }

      return grid;
    }, []);

    const getBounds = () => new L.Bounds(L.point([-r, -r]), size.add([r, r]));


    const tmp = accumulateInGrid(
      this.props.points,
      this.props.leaflet.map,
      getBounds(this.props.leaflet.map)
    );

    console.info("tmp", tmp);

    const getDataForHeatmap = (tmp2) => roundResults(
      tmp2
    );

    const data = getDataForHeatmap(tmp);

    /*
        const getDataForHeatmap = (points, leafletMap) => roundResults(
      accumulateInGrid(
        points,
        leafletMap,
        getBounds(leafletMap)
      )
    );

        //console.info(this.props.points)
        const data = getDataForHeatmap(this.props.points, this.props.leaflet.map);
    
        console.info("blabla", data)
    */
    // Get the y,x dimensions of the map
    var y = size.y;
    var x = size.x;
    // calculate the distance the one side of the map to the other using the haversine formula
    var maxMeters = this.props.leaflet.map.containerPointToLatLng([0, y]).distanceTo(this.props.leaflet.map.containerPointToLatLng([x, y]));
    // calculate how many meters each pixel represents
    var MeterPerPixel = maxMeters / x;

    //console.info("MeterPerPixel", MeterPerPixel)

    MeterPerPixel = this.props.radius / MeterPerPixel;
    const pixelRad = MeterPerPixel < 1 ? 1 : Math.floor(MeterPerPixel);

    this._heatmap.clear();
    this._heatmap.setOpacity(150);
    this._heatmap.setRadius(pixelRad);
    this._heatmap.setRGBGradiant();
    this._heatmap.setData(data).redraw();

    this._frame = null;

    if (this.props.onStatsUpdate && this.props.points && this.props.points.length > 0) {
      this.props.onStatsUpdate(
        reduce(data, (stats, point) => {
          stats.max = point[3] > stats.max ? point[3] : stats.max;
          stats.min = point[3] < stats.min ? point[3] : stats.min;
          return stats;
        }, { min: Infinity, max: -Infinity })
      );
    }

    //this.props.leaflet.map.setView(new L.LatLng(46.528188, 6.615687));
  }


  render(): React.Element {
    return null;
  }

});