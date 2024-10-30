var watchID = navigator.geolocation.watchPosition(sucess, error)

var map;

const pontosColeta = [
    { id: 1, nome: "UBS Laranjeiras", latitude: -19.9443595, longitude: -44.1292374 },
    { id: 2, nome: "Supermercado Apoio Mineiro Betim", latitude: -19.9762, longitude: -44.1960 }
]

function generateGoogleMapsLink(destLat, destLng, userLat, userLng) {
    return `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${destLat},${destLng}&travelmode=driving`;
}   

function sucess(position) {
    const userLatitude = position.coords.latitude;
    const userLongitude = position.coords.longitude;

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
    
    L.marker([pontosColeta[0].latitude, pontosColeta[0].longitude]).addTo(map)
        .bindPopup(`
        <b>UBS Laranjeiras</b><br>
        Materiais: Medicamentos vencidos e seringas<br>
        <a href="${generateGoogleMapsLink(pontosColeta[0].latitude, pontosColeta[0].longitude, userLatitude, userLongitude)}" target="_blank">
            Ver rota no Google Maps
        </a>
    `);
}

function error(err) {
    console.log(err);
}






