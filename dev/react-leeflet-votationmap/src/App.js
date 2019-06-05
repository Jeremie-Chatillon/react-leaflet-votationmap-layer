import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import MyMap from './MyMap';
import votationLayer from './components/VotationLayer';

import VotationLayer from './components/VotationLayer';

var data = [[38,20,2]]


class App extends Component {
  render() {
    return (
      <div className="App">
        <MyMap />
{/**
        <script type="text/javascript" >
          VotationLayer().
        </script>
*/}
      </div>
    );
  }
}

export default App;
