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

const API_KEY = AIzaSyCcq9sfKruEgeckm_yRwLmBdkOFCSQ3SLA;

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

//key is
