
import { MapLayer, withLeaflet } from 'react-leaflet';
import L from 'leaflet';
import React from 'react';
import PropTypes from 'prop-types';

class VoationMap extends MapLayer {


    componentDidMount() {

        const VotMap = L.Layer.extend({
            onAdd: (leafletMap) => leafletMap.getPanes().overlayPane.appendChild(el),
            addTo: (leafletMap) => {
              leafletMap.addLayer(this);
              return this;
            },
            onRemove: (leafletMap) => safeRemoveLayer(leafletMap, el)
          });


        this._heatmap = simpleheat(this._el);
    }

    static propTypes = {
        gradient: PropTypes.object
    };

    redraw() {
        const r = this._heatmap._r;

        const radius = 15;



    }

    render() {
        return (
          null
        );
      }
}

export default VoationMap;