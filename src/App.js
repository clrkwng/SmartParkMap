import React, { useState, useEffect } from "react";
import {
  withGoogleMap,
  withScriptjs,
  GoogleMap,
  Marker,
  InfoWindow
} from "react-google-maps";
import * as parkData from "./data/parking_meters.json";
import mapStyles from "./mapStyles";
import Geocode from "react-geocode";

const API_KEY = AIzaSyCcq9sfKruEgeckm_yRwLmBdkOFCSQ3SLA;
Geocode.setApiKey(API_KEY);

function Map() {
  const [selectedPark, setSelectedPark] = useState(null);

  useEffect(() => {
    const listener = e => {
      if (e.key === "Escape") {
        setSelectedPark(null);
      }
    };
    window.addEventListener("keydown", listener);

    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, []);

  return (
    <GoogleMap
      defaultZoom={10}
      defaultCenter={{ lat: 39.961178, lng: -82.998795}}
      defaultOptions={{ styles: mapStyles }}
    >
      {parkData.features.map(park => (
        <Marker
          key={park.meter_number}
          position={{
            lat: park.lat,
            lng: park.long
          }}
          onClick={() => {
            setSelectedPark(park);
          }}
          icon={{
            url: `/parking_meter.svg`,
            scaledSize: new window.google.maps.Size(40, 40)
          }}
        />
      ))}

      {selectedPark && (
        <InfoWindow
          onCloseClick={() => {
            setSelectedPark(null);
          }}
          position={{
            lat: selectedPark.geometry.coordinates[1],
            lng: selectedPark.geometry.coordinates[0]
          }}
        >
          <div>
            <h2>{selectedPark.properties.NAME}</h2>
            <p>{selectedPark.properties.DESCRIPTIO}</p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}

const MapWrapped = withScriptjs(withGoogleMap(Map));

export default function MapDisplay() {
  return (
    <div style={{ textAlign:"center" }}>
    <div style={{ width: "80vw", height: "80vh", display:"inline-block" }}>
      <MapWrapped
        googleMapURL={`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=${API_KEY}`}
        //   ${process.env.REACT_APP_GOOGLE_KEY}
        // `}
        loadingElement={<div style={{ height: `100%` }} />}
        containerElement={<div style={{ height: `100%` }} />}
        mapElement={<div style={{ height: `100%` }} />}
      />
    </div>
    <div style={{ fontSize:"xx-large" }}>Honda SmartPark</div>
    </div>
  );
}

const radius = 6;

export default class SearchPage extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
          results: []
      };
  }

  findResults(address) {
    coordinates = Geocode.fromAddress(address).then(
      response => {
        const {lat, lng} = response.results[0].geometry.location;
        return {lat, lng}
      },
      error => {
        console.error(error);
      }
    );
    const results = parkData.features.filter(park => (park.lat - lat)**2 + (park.long - lng)**2 < radius**2);
    this.state.results = results;    
  }
  
  render() {
      return (
          <div>
              <div>
                  <TitleBar/>
              </div>
              <div>
                  <SearchBar/>
              </div>
              <div>
                <MapDisplay/>
              </div>
          </div>
      );
  }
}

class TitleBar extends React.Component {
  render() {
      let title = "Honda Smart Park"
      
      return (
          <div className = "titleBar">
              <div className = "title">
                  {title}
              </div>
              <div>
                  <Menu/>
              </div>
          </div>
      );
  }
}

class SearchBar extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
        value: '',
        prevValue: ''
      };
  
      this.handleChange = this.handleChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
      this.onSubmit = this.props.findResults;
  }

  handleChange(event) {
      this.setState({value: event.target.value});
  }

  handleSubmit(event) {
      if (this.state.prevValue != this.state.value) {
        this.onSubmit(this.state.value);
        this.state.prevValue = this.state.value;
      }
      event.preventDefault();
  }

  render() {
      return (
          <div>
              <form onSubmit={this.handleSubmit}>
                  <input type="text"  value={this.state.value} onChange={this.handleChange} />
              </form>
          </div>
      );
  }
}

class TimeBar extends React.Component {

}

class Menu extends React.Component {
  render() {
      return (
          <div>
              {"Menu"}
          </div>
      );
  }
}



