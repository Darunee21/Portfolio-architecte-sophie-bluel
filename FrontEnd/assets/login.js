const form = document.querySelector("#login-form form");

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const email = document.querySelector("#email").value;
  const password = document.querySelector("#password").value;

  fetch("http://localhost:5678/api/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
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
    });
});

function displayError(message) {
  let errorElement = document.querySelector(".login-error");

  if (!errorElement) {
    errorElement = document.createElement("p");
    errorElement.classList.add("login-error");
    errorElement.style.color = "red";
    errorElement.style.marginTop = "10px";
    form.appendChild(errorElement);
  }

  errorElement.textContent = message;
}