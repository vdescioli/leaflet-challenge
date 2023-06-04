// Using URL for all earthquakes from the past 7 days
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the URL
d3.json(url).then(function (data) {
  // Send the data.features object to the createFeatures function and console log.
  createFeatures(data.features);
  console.log(data.features);
});

function createFeatures(earthquakeData) {

  // Add popup that indicates the place, time, magnitude, and depth.
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]}<p/>`);
  }

    // Run the onEachFeature function once for each piece of data in the array and pointToLayer for markers.
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: markerAttributes
  });

  // Send our earthquakes layer to the createMap function/
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Create the base layer.
    var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create a baseMaps and overlay objects.
  var baseMaps = {
    "Topographic Map": topo
  };

  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map.
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [topo, earthquakes]
  });

  // Create a layer control.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
  legend.addTo(myMap);
}

function colorByDepth(depth) {
  if (depth<10) return "greenyellow";
  else if(depth<30) return "#e9fb05";
  else if(depth<50) return "#ffd100";
  else if(depth<70) return "orange";
  else if(depth<90) return "#ff7300";
  else return "red";
};

function markerAttributes(feature, location) {
  var markers = {
    radius: feature.properties.mag*7000,
    fillColor: colorByDepth(feature.geometry.coordinates[2]),
    fillOpacity: 1,
    color: colorByDepth(feature.geometry.coordinates[2]),
    weight: 1
  }
  return L.circle(location, markers);
};

// Setting up Legend
let legend = L.control({position: "bottomright"});
legend.onAdd = function() {
  var div = L.DomUtil.create("div", "info legend");
  var limits = [-10, 10, 30, 50, 70, 90];
  var labels = [];
  
  for (let i=0; i<limits.length; i++) {
    labels.push("<ul style='background-color: " + colorByDepth(limits[i] +1) + "'> <span>" + limits[i] + (limits[i+1] ? "&ndash;" + limits[i+1] + "" : "+") + "</span></ul>")
  }
  div.innerHTML += "<ul>" + labels.join("") + "</ul>";
  return div;
}