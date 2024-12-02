import { auth, db } from './firebase.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getDoc, doc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

window.onload = function () {
  onAuthStateChanged(auth, async (user) => {
    const loginButton = document.getElementById('login'); // Botão de Login
    const userMenu = document.getElementById('user-menu'); // Menu de Usuário

    if (user) {
      if (loginButton) loginButton.style.display = "none";
      if (userMenu) userMenu.style.display = "block";
    } else {
      if (loginButton) loginButton.style.display = "block";
      if (userMenu) userMenu.style.display = "none";
    }
  });

  document.addEventListener("click", (event) => {
    if (event.target.id === 'logout') {
      event.preventDefault();
      signOut(auth)
        .then(() => {
          console.log("Usuário deslogado");
          window.location.href = "/index.html";
        })
        .catch((error) => {
          console.error("Erro ao fazer logout:", error.message);
        });
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, async (user) => {
    const loginButton = document.getElementById('login'); // Botão de Login
    const userMenu = document.getElementById('user-menu'); // Menu de Usuário

    if (user) {
      if (loginButton) loginButton.style.display = "none";
      if (userMenu) userMenu.style.display = "block";
    } else {
      if (loginButton) loginButton.style.display = "block";
      if (userMenu) userMenu.style.display = "none";
    }
  });

  document.addEventListener("click", (event) => {
    if (event.target.id === 'logout') {
      event.preventDefault();
      signOut(auth)
        .then(() => {
          console.log("Usuário deslogado");
          window.location.href = "/index.html";
        })
        .catch((error) => {
          console.error("Erro ao fazer logout:", error.message);
        });
    }
  });
});