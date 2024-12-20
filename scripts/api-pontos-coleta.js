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
        { id: 1, nome: "UBS Laranjeiras", latitude: -19.9443595, longitude: -44.1292374, tipoLixo: "Reciclável", horarioColeta: "Segunda a Sexta, 08:00 - 18:00" },
        { id: 2, nome: "Supermercado Apoio Mineiro Betim", latitude: -19.9762, longitude: -44.1960, tipoLixo: "Orgânico", horarioColeta: "Terça e Quinta, 07:00 - 10:00" },
        { id: 3, nome: "EcoPonto Centro-Sul", latitude: -19.9334, longitude: -43.9378, tipoLixo: "Eletrônicos", horarioColeta: "Segunda a Sexta, 09:00 - 17:00" },
        { id: 4, nome: "Parque Municipal Américo Renné Giannetti", latitude: -19.9213, longitude: -43.9377, tipoLixo: "Reciclável", horarioColeta: "Segunda a Sexta, 10:00 - 16:00" },
        { id: 5, nome: "Centro de Coleta Santa Amélia", latitude: -19.8512, longitude: -43.9544, tipoLixo: "Orgânico", horarioColeta: "Segunda, 08:00 - 12:00" },
        { id: 6, nome: "Supermercado BH", latitude: -19.9545, longitude: -44.0363, tipoLixo: "Reciclável", horarioColeta: "Sábado, 10:00 - 14:00" },
        { id: 7, nome: "UBS Prado", latitude: -19.9312, longitude: -43.9785, tipoLixo: "Orgânico", horarioColeta: "Quarta, 08:00 - 12:00" },
        { id: 8, nome: "UBS Estoril", latitude: -19.9430, longitude: -44.0250, tipoLixo: "Reciclável", horarioColeta: "Segunda a Sexta, 08:00 - 18:00" },
        { id: 9, nome: "EcoPonto Barreiro", latitude: -19.9676, longitude: -44.0245, tipoLixo: "Eletrônicos", horarioColeta: "Segunda a Sexta, 09:00 - 17:00" },
        { id: 10, nome: "Reciclagem Belo Horizonte", latitude: -19.9215, longitude: -43.9253, tipoLixo: "Reciclável", horarioColeta: "Sábado, 10:00 - 14:00" }
    ];

    if (!map) {
        initializeMap(userLatitude, userLongitude);
    } else {
        map.setView([userLatitude, userLongitude], 13);
    }

    addUserLocation(userLatitude, userLongitude);

    pontosColeta.forEach(ponto => {
        const popupContent = `
            <strong>${ponto.nome}</strong><br>
            <strong>Tipo de Lixo:</strong> ${ponto.tipoLixo}<br>
            <strong>Horário de Coleta:</strong> ${ponto.horarioColeta}
        `;

        const marker = L.marker([ponto.latitude, ponto.longitude])
            .addTo(map)
            .bindPopup(popupContent);
    });
}



function onError(err) {
    console.log("Erro ao obter localização", err);
}
