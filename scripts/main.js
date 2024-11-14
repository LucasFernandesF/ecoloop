document.addEventListener("DOMContentLoaded", function () {
    fetch('../layouts/menu.html')
        .then(response => {
            if (!response.ok) throw new Error('Erro ao carregar o arquivo header.html');
            return response.text();
        })
        .then(data => {
            document.querySelector('header').innerHTML = data;
        })
        .catch(error => console.error(error));

    fetch('../layouts/footer.html')
        .then(response => {
            if (!response.ok) throw new Error('Erro ao carregar o arquivo footer.html');
            return response.text();
        })
        .then(data => {
            document.querySelector('footer').innerHTML = data;
        })
        .catch(error => console.error(error));
});

