import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCQXWDErfnbUaJAch6UJ0Vy65hEU60YWfY",
    authDomain: "trabalho-a3-ecoloop.firebaseapp.com",
    projectId: "trabalho-a3-ecoloop",
    storageBucket: "trabalho-a3-ecoloop.appspot.com",
    messagingSenderId: "8816311291",
    appId: "1:8816311291:web:dd082d8be4d77af648695e",
    measurementId: "G-NQ6GMTQY5R"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault(); 

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        alert("Login realizado com sucesso!");
    } catch (error) {
        console.error("Erro ao logar: ", error.message);
        alert("Erro ao logar: " + error.message);
    }
});


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
});