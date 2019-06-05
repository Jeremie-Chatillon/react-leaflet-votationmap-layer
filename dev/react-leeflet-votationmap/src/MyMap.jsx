import React from 'react';
import L from 'leaflet';
import {
  Map, TileLayer, Marker, Popup, CircleMarker,
} from 'react-leaflet';

import VotationMapLayer from './components/VotationMapLayer';
import VotMap2 from './components/VotMap2';
import VotMap3 from './components/VotMap3';
import { dataExemple } from './components/dataExemple';


//const datas = [{ x: 500, y: 120, v: 5 }, { x: 500, y: 100, v: 1 }, { x: 200, y: 500, v: 2 }, { x: 100, y: 500, v: 1 }, { x: 500, y: 500, v: 5 }, { x: 400, y: 400, v: 4 }, { x: 200, y: 200, v: 2 }, { x: 0, y: 199, v: 1 }, { x: 100, y: 100, v: 1 }, { x: 300, y: 300, v: 3 }]
const realData = [{ x: 46.528188, y: 6.615687, v: 1 }, { x: 46.544937, y: 6.557563, v: 5 }, { x: 46.528182, y: 6.615687, v: 2 }];


export const addressPoints = [
  [46.528188, 6.615687, 1],
  [46.528180, 6.615680, 2],
  [46.5280, 6.61560, 3],
 
]

const gradient = {
  0.1: '#89BDE0', 0.2: '#96E3E6', 0.4: '#82CEB6',
  0.6: '#FAF3A5', 0.8: '#F5D98B', '1.0': '#DE9A96'
};

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
      zoom: 13,
      datas: dataExemple(100,100.0)
    }

    
  
  }
  componentDidMount(){
    //console.info("dataExemple", dataExemple(100,100.0))
    this.setState({datas:dataExemple(100 ,100.0)})
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

    const { datas } = this.state;
    return (
      <div style={map} >
        {console.info("stttt")}
        <Map key="map" style={map} center={[46.7149, 6.3719]} zoom={15}>
          

          <TileLayer
            key="tileLayer"
            attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
            url="https://maps.tilehosting.com/styles/streets/{z}/{x}/{y}.png?key=YrAASUxwnBPU963DZEig"
          />
          {/*
          <VotationMapLayer
            points={realData}
          />
*/}

          <VotMap3
            fitBoundsOnLoad={false}
            fitBoundsOnUpdate={false}
            points={datas}
            longitudeExtractor={m => m[1]}
            latitudeExtractor={m => m[0]}
            gradient={gradient}
            intensityExtractor={m => m[2]}
            radius={Number(300)}
            blur={Number(8)}
            max={Number.parseFloat(0.5)}
          />
        </Map>
        <button type="button" onClick={this.onClick}>

        </button>
      </div>
    );
  }
}

export default MyMap;