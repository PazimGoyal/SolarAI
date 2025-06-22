"use strict";
var lat = 43.70473;
var long = -79.755893;
document.addEventListener("DOMContentLoaded", () => {
    // Map initialisation
    var map = L.map("map").setView([lat, long], 15);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    var layerGroup = L.layerGroup().addTo(map);
    L.marker([lat, long]).addTo(layerGroup);
    updateForm(lat, long);
    fetch_address(lat, long);
    plotlines(lat, long, 180);
    map.on("click", popup);
    const search_form = document.getElementById("searchForm");
    const lat_long_form = document.getElementById("latLongForm");
    const latitude = document.getElementById("latitude");
    const longitude = document.getElementById("longitude");
    const offset = document.getElementById("offset");
    const locate_marker = document.getElementById("locate_marker");
    // functions
    function loadingBar(enable) {
        const div = document.getElementById("loading_overlay");
        if (enable) {
            div.style.display = "flex"; // or "flex", "grid", etc.
        }
        else {
            div.style.display = "none";
        }
    }
    function updateForm(latitude, longitude) {
        const latInput = document.getElementById("latitude");
        const lonInput = document.getElementById("longitude");
        if (latInput && lonInput) {
            latInput.value = latitude.toString();
            lonInput.value = longitude.toString();
        }
    }
    function popup(e) {
        layerGroup.clearLayers();
        L.marker(e.latlng).addTo(layerGroup);
        console.log(e.latlng);
        updateForm(e.latlng.lat, e.latlng.lng);
        fetch_address(e.latlng.lat, e.latlng.lng);
    }
    function update_address(address) {
        const disp_address = document.getElementById("disp_address");
        disp_address.innerHTML = address;
    }
    function fetch_address(lat, long) {
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${long}&format=json`, {
            headers: {},
        })
            .then((res) => res.json())
            .then((res) => {
            update_address(res.display_name);
        });
    }
    function fetch_latlong(address) {
        console.log(address);
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address.toString())}`)
            .then((res) => res.json())
            .then((data) => {
            const lat = data[0].lat;
            const lon = data[0].lon;
            updateForm(lat, lon);
            update_address(address.toString());
        });
    }
    search_form.addEventListener("submit", (event) => {
        loadingBar(true);
        event.preventDefault();
        const address = document.getElementById("search_address");
        fetch_latlong(address.toString());
        loadingBar(false);
    });
    lat_long_form.addEventListener("submit", (event) => {
        event.preventDefault();
        const latitude_val = latitude.value.trim();
        const longitude_val = longitude.value.trim();
        const offset_val = offset.value.trim();
        if (!latitude_val || !longitude_val)
            return;
        loadingBar(true);
        try {
            const response = fetch("http://localhost:8000", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    longitude: longitude_val,
                    latitude: latitude_val,
                    offset: offset_val,
                }),
            })
                .then((res) => res.json())
                .then((res) => {
                const output = document.getElementById("output");
                output.innerHTML = "";
                for (var key in res) {
                    // if (key == "timestamp" || key == "GHI") {
                    if (key.startsWith("tab_")) {
                        continue;
                    }
                    let inner = `<div class="grid_obj"><h3>${key}</h3><h4>${res[key]}<h4></div>`;
                    output.innerHTML = output.innerHTML + inner;
                }
                const ghi = res["tab_GHI"];
                const dhi = res["tab_DHI"];
                const dni = res["tab_DNI"];
                const time = res["tab_timestamp"];
                const list = document.getElementById("solar_in");
                if (list) {
                    let inner = "<h2>Solar insolation intensity estimates</h2><table><tr><th>DATE TIME</th><th>GHI</th><th>DHI</th><th>DNI</th><tr>";
                    for (let i = 0; i < time.length; i++) {
                        inner += `<tr><td>${time[i]}</td><td>${ghi[i]} W/m²</td><td>${dhi[i]} W/m²</td><td>${dni[i]} W/m²</td></tr>`;
                    }
                    inner += `</table>`;
                    list.innerHTML = inner;
                }
                if ("optimal Azimuth" in res) {
                    plotlines(Number(latitude_val), Number(longitude_val), res["optimal Azimuth"]);
                }
                loadingBar(false);
            }).catch((err) => {
                alert("Error in Backend");
                loadingBar(false);
            });
        }
        catch (error) {
            loadingBar(false);
            console.error("POST request failed:", error);
        }
    });
    locate_marker.addEventListener("click", () => {
        const latitude_val = Number(latitude.value.trim());
        const longitude_val = Number(longitude.value.trim());
        let obj = { latlng: { lat: latitude_val, lng: longitude_val } };
        popup(obj);
        const latlng = new L.LatLng(latitude_val, longitude_val);
        map.panTo(latlng);
    });
    function plotlines(latitude, longitude, azimuth) {
        const length = 0.001;
        const azimuthRad = (azimuth * Math.PI) / 180;
        const endLat = latitude + length * Math.cos(azimuthRad);
        const endLng = longitude + length * Math.sin(azimuthRad);
        const line = L.polyline([
            [latitude, longitude],
            [endLat, endLng],
        ], {
            color: "red",
            weight: 3,
        }).addTo(layerGroup);
        const arrowSize = 0.0003;
        const leftWingc = [
            endLat - arrowSize * Math.cos(azimuthRad - Math.PI / 6),
            endLng - arrowSize * Math.sin(azimuthRad - Math.PI / 6),
        ];
        const rightWingc = [
            endLat - arrowSize * Math.cos(azimuthRad + Math.PI / 6),
            endLng - arrowSize * Math.sin(azimuthRad + Math.PI / 6),
        ];
        const arrowTip = new L.LatLng(endLat, endLng);
        const leftWing = new L.LatLng(leftWingc[0], leftWingc[1]);
        const rightWing = new L.LatLng(rightWingc[0], rightWingc[1]);
        L.polygon([arrowTip, leftWing, rightWing], {
            color: "red",
            fillColor: "red",
            fillOpacity: 1,
        }).addTo(layerGroup);
    }
});
