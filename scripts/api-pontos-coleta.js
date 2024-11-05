var watchID = navigator.geolocation.watchPosition(onSuccess, onError);
var map;

function generateGoogleMapsLink(destLat, destLng, userLat, userLng) {
    return `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${destLat},${destLng}&travelmode=driving`;
}

function initializeMap(lat, long) {
    map = L.map('map').setView([lat, long], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
}

function addUserLocation(lat, long) {
    L.marker([lat, long]).addTo(map)
        .bindPopup('Localização atual')
        .openPopup();
}

function addCollectionPoints(userLat, userLng, pontos) {
    pontos.forEach(point => {
        L.marker([point.latitude, point.longitude]).addTo(map)
            .bindPopup(`
                <b>${point.nome}</b><br>
                <a href="${generateGoogleMapsLink(point.latitude, point.longitude, userLat, userLng)}" target="_blank">
                    Ver rota no Google Maps
                </a>
            `);
    });
}

function onSuccess(position) {
    const userLatitude = position.coords.latitude;
    const userLongitude = position.coords.longitude;

    const pontosColeta = [
        { id: 1, nome: "UBS Laranjeiras", latitude: -19.9443595, longitude: -44.1292374 },
        { id: 2, nome: "Supermercado Apoio Mineiro Betim", latitude: -19.9762, longitude: -44.1960 }
    ];

    if (!map) {
        initializeMap(userLatitude, userLongitude);
    } else {
        map.setView([userLatitude, userLongitude], 13);
    }

    addUserLocation(userLatitude, userLongitude);
    addCollectionPoints(userLatitude, userLongitude, pontosColeta);
}

function onError(err) {
    console.log("Erro ao obter localização", err);
}
