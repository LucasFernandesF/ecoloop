var watchID = navigator.geolocation.watchPosition(sucess, error, {
    enableHighAccuracy: true,
    timeout: 5000
})

var map;

function sucess(position) {
    const userLatitude = position.coords.latitude;
    const userLongitude = position.coords.longitude;
    console.log(userLatitude, userLongitude);

    if (map === undefined) {
        map = L.map('map').setView([userLatitude, userLongitude], 13);
    } else {
        map.remove();
        map = L.map('map').setView([userLatitude, userLongitude], 13);
    }

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker([userLatitude, userLongitude]).addTo(map)
        .bindPopup('Localização atual')
        .openPopup();
}

function error(err) {
    console.log(err);
}






