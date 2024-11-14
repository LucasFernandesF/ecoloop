import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCQXWDErfnbUaJAch6UJ0Vy65hEU60YWfY",
    authDomain: "trabalho-a3-ecoloop.firebaseapp.com",
    projectId: "trabalho-a3-ecoloop",
    storageBucket: "trabalho-a3-ecoloop.firebasestorage.app",
    messagingSenderId: "8816311291",
    appId: "1:8816311291:web:dd082d8be4d77af648695e",
    measurementId: "G-NQ6GMTQY5R"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.getElementById("register-form").addEventListener("submit", async (e) => {
    e.preventDefault();

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
        // Criar usuário com email e senha
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Salvar dados no Firestore
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
});