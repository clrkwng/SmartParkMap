import React, { useState, useEffect } from "react";
import {
  withGoogleMap,
  withScriptjs,
  GoogleMap,
  Marker,
  InfoWindow
} from "react-google-maps";
import { compose, withProps } from "recompose";
import * as parkData from "./data/parking_meters.json";
import mapStyles from "./mapStyles";
import Geocode from "react-geocode";
import KDBush from 'kdbush';

const API_KEY = 'AIzaSyCcq9sfKruEgeckm_yRwLmBdkOFCSQ3SLA';
Geocode.setApiKey(API_KEY);

const meterKD = new KDBush(parkData.features, p =>p.lat, p=>p.long, 100000, Float64Array);

function Map(props) {
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
      defaultCenter={props.point}
      defaultOptions={{ styles: mapStyles }}
      >
      {props.results.map(park => (
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
            <p>{selectedPark.properties.DESCRIPTION}</p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}

const MapWrapped = compose(
  withProps({
    googleMapURL: `https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=${API_KEY}`,
      //   ${process.env.REACT_APP_GOOGLE_KEY}
      // `}
      loadingElement: <div style={{ height: `100%` }} />,
      containerElement: <div style={{ height: `100%` }} />,
      mapElement: <div style={{ height: `100%` }} />
  }),
  withScriptjs,
  withGoogleMap
)(Map);

function MapDisplay(props) {
  return (
    <div style={{ textAlign:"center" }}>
    <div style={{ width: "80vw", height: "80vh", display:"inline-block" }}>
      <MapWrapped point={props.point} results={props.results}/>
    </div>
    </div>
  );
}

const radius = .001;

export default class SearchPage extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
          point: {lat: 39.961178, lng: -82.998795},
          results: [],
          test: "empty"
      };
  }

  findResults(address) {
    Geocode.fromAddress(address).then(
      response => {
        const {lat, lng} = response.results[0].geometry.location;
        // this.setState({test: `${lat} ${lng}`})
        return {lat, lng};
      },
    ).then(
      ({lat, lng})=>{
        this.setState({test: `${lat} ${lng}`});
        const results = meterKD.within(lat, lng, radius).map(id => parkData.features[id]);
        this.setState({
          point: {lat: lat, lng: lng},
          results: results});
      }
    ).then(
      ()=>{
        if (this.state.results.length < 1) {
          this.setState({test: "no results"});
        } else {
          this.setState({test: `${this.state.results.length} results found`});
        }
      }
    ).catch(
      error => {
        this.setState({test: "error"});
        console.error(error);
        return this.state.point;
      }
    );
  }
  
  render() {
      return (
          <div>
              <div>
                <TitleBar/>
              </div>
              <div>
                <SearchBar findResults={this.findResults.bind(this)}/>
              </div>
              <div>
                {this.state.test}
              </div>
              <div>
                <MapDisplay point={this.state.point} results={this.state.results}/>
              </div>

          </div>
      );
  }
}

class TitleBar extends React.Component {
  render() {
      return (
          <div className = "titleBar">
              <div style={{ fontSize: "xx-large" }}>
                Honda SmartPark
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
      if (this.state.prevValue !== this.state.value) {
        this.onSubmit(this.state.value);
        this.setState({prevValue: this.state.value})
      }
      event.preventDefault();
  }

  render() {
      return (
          <div>
              <form onSubmit={this.handleSubmit}>
                  <input type="text"  value={this.state.value} onChange={this.handleChange} />
                  <button onClick={this.handleSubmit}>
                    Search
                  </button>
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
