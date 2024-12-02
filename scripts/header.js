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
    const userIcon = document.getElementById('user-icon'); // Imagem de perfil

    if (user) {
      if (loginButton) loginButton.style.display = "none";
      if (userMenu) userMenu.style.display = "block";

      // Aqui, você deve pegar o link da imagem diretamente do banco de dados
      const userId = user.uid; // Usando o UID do Firebase para buscar no banco
      const imageUrl = await getImageUrlFromDatabase(userId); // Função fictícia para pegar a URL

      if (imageUrl) {
        userIcon.src = imageUrl; // Define a imagem de perfil
      } else {
        userIcon.src = "/path/to/default/profile.jpg"; // Imagem padrão caso não tenha
      }

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

async function getImageUrlFromDatabase(userId) {
  try {
    const userRef = doc(db, "users", userId);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      const userData = docSnap.data();
      if (userData.img) {
        return userData.img;
      } else {
        return "../imgs/user_profile.png";
        console.log("Sem imagem:");
      }
    } else {
      console.log("Usuário não encontrado no banco");
    }
  } catch (error) {
    console.error("Erro ao buscar a imagem do usuário:", error);
    return null;
  }
}
