/**
 * Soumet le formulaire de connexion :
 * récupère l'email et le mot de passe saisis,
 * envoie une requête à l’API pour vérifier les identifiants,
 * puis redirige vers la page d’accueil si la connexion est validée.
 */
function handleLoginSubmit(event) {
  event.preventDefault();

  const email = document.querySelector("#email").value;
  const password = document.querySelector("#password").value;

  loginUser(email, password);
}

/**
 * Envoie les identifiants à l'API pour connexion.
 * @param {string} email - L'adresse email de l'utilisateur.
 * @param {string} password - Le mot de passe de l'utilisateur.
 */
function loginUser(email, password) {
  fetch("http://localhost:5678/api/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
    .then(function (response) {
      if (response.ok) {
        return response.json();
      } else {
        displayError("Identifiants incorrects.");
      }
    })
    .then(function (data) {
      if (data) {
        localStorage.setItem("token", data.token);
        window.location.href = "index.html";
      }
    })
    .catch(function (error) {
      console.error("Erreur lors de la connexion :", error);
      displayError("Une erreur est survenue. Veuillez réessayer.");
    });
}

/**
 * Affiche un message d'erreur sous le formulaire de connexion.
 * @param {string} message - Le message à afficher.
 */
function displayError(message) {
  let errorElement = document.querySelector(".login-error");

  if (!errorElement) {
    errorElement = document.createElement("p");
    errorElement.classList.add("login-error");
    errorElement.style.color = "red";
    errorElement.style.marginTop = "10px";
    document.querySelector("#login-form form").appendChild(errorElement);
  }

  errorElement.textContent = message;
}

// Écouteur d'événement pour la soumission du formulaire
const form = document.querySelector("#login-form form");
form.addEventListener("submit", handleLoginSubmit);