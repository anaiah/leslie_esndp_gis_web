// Assuming you have a Leaflet map instance called 'map'

function findNearbyPOIs(lat, lng, type) {
  const apiKey = "YOUR_GOOGLE_MAPS_API_KEY";
  const radius = 1000; // Search within 1000 meters

  A type (e.g., "church", "school", "bus_station", "train_station"). You can send multiple requests, one for each type of POI.

  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${apiKey}`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.results) {
        data.results.forEach(place => {
          const marker = L.marker([place.geometry.location.lat, place.geometry.location.lng]).addTo(map);
          marker.bindPopup(`<b>${place.name}</b><br>${place.vicinity}`);
        });
      }
    });
}

// Example usage:
const myLat = 34.0522; // Example latitude
const myLng = -118.2437; // Example longitude

findNearbyPOIs(myLat, myLng, "church");
findNearbyPOIs(myLat, myLng, "school");
findNearbyPOIs(myLat, myLng, "bus_station");
findNearbyPOIs(myLat, myLng, "train_station");
