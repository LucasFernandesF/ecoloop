import { auth, db } from './firebase.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { setDoc, doc, serverTimestamp, getDocs, collection, query, where } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

export function toggleOngFields() {
    const ongFields = document.getElementById("ongFields");
    ongFields.style.display = ongFields.style.display === "none" ? "block" : "none";
}

export async function cadastrarUsuarios() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const name = document.getElementById("name").value;

    if (password !== confirmPassword) {
        showAlertNok("As senhas são diferentes.");
        return;
    }

    const isOng = document.getElementById("isOng").checked;
    const ongName = document.getElementById("nome-ong").value;
    const cnpj = document.getElementById("cnpj").value;

    try {
        // Verifica se o e-mail já existe no Firestore
        const querySnapshot = await getDocs(query(collection(db, "users"), where("email", "==", email)));

        if (!querySnapshot.empty) {
            showAlertNok("O e-mail já está cadastrado.");
            return;
        }

        // Tenta registrar o usuário no Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Adiciona os dados ao Firestore
        await setDoc(doc(db, "users", user.uid), {
            name: name,
            email: email,
            isOng: isOng,
            ongName: isOng ? ongName : null,
            cnpj: isOng ? cnpj : null,
            createdAt: serverTimestamp()
        });

        showAlertOk("Usuário registrado com sucesso!");

        $('#modal-close-btn, #modal-close').on('click', function () {
            window.location.href = '../html/minha-conta.html';
        });
    } catch (error) {
        if (error.code === "auth/email-already-in-use") {
            showAlertNok("O e-mail já está cadastrado no sistema de autenticação.");
        } else {
            console.error("Erro ao registrar usuário:", error);
            showAlertNok("Erro ao registrar: " + error.message);
        }
    }

}


document.getElementById("register-form").addEventListener("submit", (e) => {
    e.preventDefault();
    cadastrarUsuarios();
});
