import React from 'react';
import L from 'leaflet';
import {
  Map, TileLayer, Marker, Popup, CircleMarker,
} from 'react-leaflet';

//import VotationMapLayer from './components/VotationMapLayer'

const styles = {
  map: {
    backgroundColor: '#CCCCCC',
    position: 'sticky',
    top: 0,
    left: 0,
    right: 0,
    //height: 'calc(100vh - 114px)',
    height: 100,
  },
}

class MyMap extends React.Component {
  constructor() {
    super()
    this.state = {
      lat: 51.505,
      lng: -0.09,
      zoom: 13
    }
  }

  render() {

    const map = {
      backgroundColor: '#CCCCCC',
      position: 'sticky',
      top: 0,
      left: 0,
      right: 0,
      height: 'calc(100vh - 114px)',
    };

    const { classes } = this.props;
    const position = [this.state.lat, this.state.lng];


    return (
      <div style={map} >
        <Map key="map" style={map } center={[46.528188, 6.615687]} zoom={12}>


          <TileLayer
            key="tileLayer"
            attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
            url="https://maps.tilehosting.com/styles/streets/{z}/{x}/{y}.png?key=YrAASUxwnBPU963DZEig"
          />
          
        

        </Map>
        <button type="button" onClick={this.onClick}>
              
        </button>
      </div>
    );
  }
}

export default MyMap;