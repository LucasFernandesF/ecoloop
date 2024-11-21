import { auth, db } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getDoc, doc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const userLogado = document.querySelector('.email-logado');
  console.log(userLogado);

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const docRef = doc(db, "users", user.uid);
      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          const emailToDisplay = userData.email || user.email;
          if (userLogado) {
            userLogado.textContent = emailToDisplay;
            userLogado.style.display = "block";
            console.log(user)
          }
        }
      } catch (error) {
        console.error("Erro ao buscar dados do Firestore:", error);
      }
    } else {
      console.log("Nenhum usuário logado.");
      if (userLogado) {
        userLogado.style.display = "none";
      }
    }
  });
});

