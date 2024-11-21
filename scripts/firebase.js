import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

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

export { auth, db };
