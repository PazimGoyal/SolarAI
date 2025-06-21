

var lat=43.704730;
var long= -79.755893;

var map = L.map('map').setView([lat,long], 15);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var layerGroup = L.layerGroup().addTo(map);
L.marker([lat,long]).addTo(layerGroup);


updateForm(lat,long)
fetch_address(lat,long)


function updateForm(latitude: number, longitude: number) {
  const latInput = document.getElementById('latitude') as HTMLInputElement;
  const lonInput = document.getElementById('longitude') as HTMLInputElement;

  if (latInput && lonInput) {
    latInput.value = latitude.toString();
    lonInput.value = longitude.toString();
  }
}



function popup(e:any){
layerGroup.clearLayers();
L.marker(e.latlng).addTo(layerGroup);
updateForm(e.latlng.lat,e.
    latlng.lng,0);
fetch_address(e.latlng.lat,e.latlng.lng);
} 

function update_address(address:string){
      const disp_address = document.getElementById('disp_address') as HTMLInputElement;
        disp_address.innerHTML=address;
}

function fetch_address(lat:number, long:number){
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${long}&format=json`, {
    headers: {
    }
}).then(res => res.json())
    .then(res => {
update_address(res.display_name);
        

});

}

function fetch_latlong(){
var address  = document.getElementById('search_address') as HTMLInputElement;

 fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address.toString())}`)
  .then(res => res.json())
  .then(data => {
    const lat = data[0].lat;
    const lon = data[0].lon;

    updateForm(lat,lon)

    // Update your map here
  });
}


map.on('click', popup);

