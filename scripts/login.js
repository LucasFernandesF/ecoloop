import { auth, db } from './firebase.js';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { doc, query, collection, where, getDocs, setDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";


document.addEventListener("DOMContentLoaded", function () {
    fetch('../layouts/alerta.html')
        .then(response => {
            if (!response.ok) throw new Error('Erro ao carregar o arquivo footer.html');
            return response.text();
        })
        .then(data => {
            document.querySelector('alerta').innerHTML = data;
        })
        .catch(error => console.error(error));
    fetch('../layouts/esqueci-senha.html')
        .then(response => {
            if (!response.ok) throw new Error('Erro ao carregar o arquivo footer.html');
            return response.text();
        })
        .then(data => {
            document.querySelector('esqueci-senha').innerHTML = data;
            $(document).ready(function () {
                $('#forgot-password-link').click(function (e) {
                    e.preventDefault();
                    $('#reset-password-modal').modal('show');
                    console.log("Modal de redefinir senha aberto");
                });

                $('#reset-password-btn').click(function (e) {
                    e.preventDefault();
                    sendResetEmail();
                });
            });
        })
        .catch(error => console.error(error));
});

export async function loginEmail() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        showAlertOk("Login realizado com sucesso!");
    } catch (error) {
        console.error("Erro ao logar: ", error.message);
        if (error.code === 'auth/invalid-credential') {
            showAlertNok("Usuário ou senha incorretos.");
        } else {
            showAlertNok("Erro ao logar: " + error.message);
        }

    }
}

document.getElementById("login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    loginEmail();
});

document.addEventListener("DOMContentLoaded", () => {

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            $('#modal-close-btn, #modal-close').on('click', function () {
                window.location.href = '../html/minha-conta.html';
            });
        }
    });
});

const authProvider = getAuth();

async function loginWithProvider(provider) {
    try {
        const result = await signInWithPopup(authProvider, provider);
        const user = result.user;

        await setDoc(doc(db, "users", user.uid), {
            name: user.displayName,
            email: user.email,
            provider: user.providerData[0].providerId,
            createdAt: serverTimestamp()
        });

        showAlertOk("Login realizado com sucesso!");
        $('#modal-close-btn, #modal-close').on('click', function () {
            window.location.href = "/minhaconta";
        });
    } catch (error) {
        console.error("Erro ao fazer login:", error);
        showAlertNok("Erro ao fazer login: " + error.message);
    }
}

document.getElementById("login-google").addEventListener("click", () => {
    const provider = new GoogleAuthProvider();
    loginWithProvider(provider);
});



function sendResetEmail() {
    var email = $('#reset-email').val();
    console.log("E-mail inserido:", email);

    if (email === "") {
        $('#reset-password-message').text('Por favor, insira seu e-mail.');
        console.log("Por favor, insira seu e-mail.");
        return;
    }

    const userEmailQuery = query(
        collection(db, "users"),
        where("email", "==", email)
    );

    getDocs(userEmailQuery)
        .then((querySnapshot) => {
            if (!querySnapshot.empty) {
                sendPasswordResetEmail(auth, email)
                    .then(() => {
                        showAlertOk('Um e-mail com o link de redefinição foi enviado para ' + email + '.');
                        $('#reset-password-modal').modal('hide');
                        console.log("E-mail de redefinição enviado para:", email);
                    })
                    .catch((error) => {
                        var errorMessage = error.message;
                        console.log("Erro ao enviar e-mail:", errorMessage);
                        $('#reset-password-modal').modal('hide');
                        showAlertNok('Ocorreu um erro: ' + errorMessage);
                    });
            } else {
                console.log("E-mail não encontrado:", email);
                $('#reset-password-modal').modal('hide');
                showAlertNok('E-mail não encontrado: ' + email + '.');
            }
        })
        .catch((error) => {
            console.log("Erro ao consultar Firestore:", error.message);
            $('#reset-password-modal').modal('hide');
            showAlertNok('Erro ao verificar e-mail: ' + error.message);
        });
}


