import { auth, db } from './firebase.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { setDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

export function toggleOngFields() {
    const ongFields = document.getElementById("ongFields");
    ongFields.style.display = ongFields.style.display === "none" ? "block" : "none";
}

export async function cadastrarUsuarios() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (password !== confirmPassword) {
        alert("As senhas são diferentes.");
        return;
    }

    const isOng = document.getElementById("isOng").checked;
    const ongName = document.getElementById("nome-ong").value;
    const cnpj = document.getElementById("cnpj").value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
            email: email,
            isOng: isOng,
            ongName: isOng ? ongName : null,
            cnpj: isOng ? cnpj : null,
            createdAt: serverTimestamp()
        });

        alert("Usuário registrado com sucesso!");
    } catch (error) {
        console.error("Erro ao registrar usuário:", error.message);
        alert("Erro ao registrar: " + error.message);
    }
}

document.getElementById("register-form").addEventListener("submit", (e) => {
    e.preventDefault();
    cadastrarUsuarios();
});
