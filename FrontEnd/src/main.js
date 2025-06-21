"use strict";
var lat = 43.704730;
var long = -79.755893;
var map = L.map('map').setView([lat, long], 15);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
var layerGroup = L.layerGroup().addTo(map);
L.marker([lat, long]).addTo(layerGroup);
updateForm(lat, long, 0);
fetch_address(lat, long);
function updateForm(latitude, longitude, offset) {
    var _a;
    const latInput = document.getElementById('latitude');
    const lonInput = document.getElementById('longitude');
    const offsetInput = document.getElementById('offset');
    if (latInput && lonInput) {
        latInput.value = latitude.toString();
        lonInput.value = longitude.toString();
        offsetInput.value = (_a = offset === null || offset === void 0 ? void 0 : offset.toString()) !== null && _a !== void 0 ? _a : ''; // Use empty string if undefined
    }
}
function popup(e) {
    layerGroup.clearLayers();
    L.marker(e.latlng).addTo(layerGroup);
    updateForm(e.latlng.lat, e.
        latlng.lng, 0);
    fetch_address(e.latlng.lat, e.latlng.lng);
}
function fetch_address(lat, long) {
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${long}&format=json`, {
        headers: {}
    }).then(res => res.json())
        .then(res => {
        const disp_address = document.getElementById('disp_address');
        disp_address.innerHTML = res.display_name;
    });
}
function fetch_latlong() {
    var address = document.getElementById('search_address');
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address.toString())}`)
        .then(res => res.json())
        .then(data => {
        const lat = data[0].lat;
        const lon = data[0].lon;
        console.log(data);
        // Update your map here
    });
}
map.on('click', popup);
