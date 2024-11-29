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
        
    fetch('../layouts/header.html')
        .then(response => {
            if (!response.ok) throw new Error('Erro ao carregar o arquivo footer.html');
            return response.text();
        })
        .then(data => {
            document.querySelector('head').innerHTML = data;
        })
        .catch(error => console.error(error));
        
    fetch('../layouts/alerta.html')
        .then(response => {
            if (!response.ok) throw new Error('Erro ao carregar o arquivo footer.html');
            return response.text();
        })
        .then(data => {
            document.querySelector('alerta').innerHTML = data;
        })
        .catch(error => console.error(error));
});

// Função para abrir o modal
function showAlertOk(message) {
    $('#modal-message').text(message); // Atualiza a mensagem do modal
    $('#custom-modal').modal('show'); // Abre o modal
}

function showAlertNok(message) {
    $('#modal-message-nok').text(message); // Atualiza a mensagem do modal
    $('#custom-modal-nok').modal('show'); // Abre o modal
}

document.addEventListener('DOMContentLoaded', function () {
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');

    // Exibir o botão após o scroll
    window.addEventListener('scroll', function () {
        if (window.scrollY > 300) {
            scrollToTopBtn.style.display = 'block';
        } else {
            scrollToTopBtn.style.display = 'none';
        }
    });

    // Scroll suave ao topo
    scrollToTopBtn.addEventListener('click', function () {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});