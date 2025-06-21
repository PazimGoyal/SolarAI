var lat = 43.70473;
var long = -79.755893;

var map = L.map("map").setView([lat, long], 15);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

var layerGroup = L.layerGroup().addTo(map);
L.marker([lat, long]).addTo(layerGroup);

updateForm(lat, long);
fetch_address(lat, long);


function loadingBar(): void {
  const div = document.getElementById("loading_overlay") as HTMLInputElement;
  if (div.style.display === "flex" || !div.style.display) {
    div.style.display = "none"; // or "flex", "grid", etc.
  } else {
    div.style.display = "flex";
  }
}

function updateForm(latitude: number, longitude: number) {
  const latInput = document.getElementById("latitude") as HTMLInputElement;
  const lonInput = document.getElementById("longitude") as HTMLInputElement;

  if (latInput && lonInput) {
    latInput.value = latitude.toString();
    lonInput.value = longitude.toString();
  }
}

function popup(e: any) {
  layerGroup.clearLayers();
  L.marker(e.latlng).addTo(layerGroup);
  console.log(e.latlng);
  updateForm(e.latlng.lat, e.latlng.lng);
  fetch_address(e.latlng.lat, e.latlng.lng);
}

function update_address(address: string) {
  const disp_address = document.getElementById(
    "disp_address"
  ) as HTMLInputElement;
  disp_address.innerHTML = address;
}

function fetch_address(lat: number, long: number) {
  fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${long}&format=json`,
    {
      headers: {},
    }
  )
    .then((res) => res.json())
    .then((res) => {
      update_address(res.display_name);
    });
}

function fetch_latlong(address: string) {
  console.log(address);
  fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      address.toString()
    )}`
  )
    .then((res) => res.json())
    .then((data) => {
      const lat = data[0].lat;
      const lon = data[0].lon;

      updateForm(lat, lon);
      update_address(address.toString());
    });
}

document.addEventListener("DOMContentLoaded", () => {
  const search_form = document.getElementById("searchForm") as HTMLFormElement;
  const lat_long_form = document.getElementById(
    "latLongForm"
  ) as HTMLFormElement;

  search_form.addEventListener("submit", (event: SubmitEvent) => {
    loadingBar();
    event.preventDefault();

    const address = document.getElementById(
      "search_address"
    ) as HTMLInputElement;
    fetch_latlong(address.toString());
    loadingBar();
  });

  lat_long_form.addEventListener("submit", (event: SubmitEvent) => {
    event.preventDefault();

    const latitude = document.getElementById("latitude") as HTMLInputElement;
    const longitude = document.getElementById("longitude") as HTMLInputElement;
    const offset = document.getElementById("offset") as HTMLInputElement;

    const latitude_val = latitude.value.trim();
    const longitude_val = longitude.value.trim();

    if (!latitude_val || !longitude_val) return;

    loadingBar();
    try {
      const response = fetch("http://127.0.0.1:8000/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          longitude: longitude_val,
          latitude: latitude_val,
          offset: offset,
        }),
      })
        .then((res) => res.json())
        .then((res) => {
          const output : HTMLDivElement = document.getElementById("output") as HTMLDivElement;
                      output.innerHTML="";

            for(var key in res){
            let inner =`<div><h3>${key}</h3><h4>${res[key]}<h4></div>`
            output.innerHTML=output.innerHTML+inner;
            // let child=document.createTextNode(inner)
            // output.appendChild(child);
            }

          loadingBar();
        });
    } catch (error) {
      loadingBar();
      console.error("POST request failed:", error);
    }
  });
});
map.on("click", popup);
