import { generateProjects, generateFilters, generateFiltersEvent } from "./genererator.js";

let projects = []

fetch("http://localhost:5678/api/works")
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    generateProjects(data);
    projects = data
  })
  .catch(function (error) {
    console.error("Erreur lors de la récupération des projets:", error);
  });



fetch("http://localhost:5678/api/categories")
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    generateFilters(data);
    generateFiltersEvent(projects)
  })
  .catch(function (error) {
    console.error("Erreur lors de la récupération des filtres:", error);
  });

const token = localStorage.getItem("token");

if (token) {
  // Affiche le bandeau noir en haut
  const banner = document.createElement("div");
  banner.classList.add("edition-banner");

  const icon = document.createElement("i");
  icon.classList.add("fa-regular", "fa-pen-to-square");

  const text = document.createElement("span");
  text.textContent = "Mode édition";

  banner.appendChild(icon);
  banner.appendChild(text);

  document.body.insertBefore(banner, document.body.firstChild);

  // remplace "login" par "logout"
  const loginItem = document.querySelector("nav li:nth-child(3)");
  loginItem.textContent = "logout";
  loginItem.style.cursor = "pointer";
  loginItem.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.reload(); // Recharge la page
  });

  // Masque les filtres
  const filters = document.querySelector(".filters");
  if (filters) {
    filters.style.display = "none";
  }
  //  Ajoute le bouton "modifier" à côté du titre "Mes projets"
  const sectionTitle = document.querySelector("#portfolio h2");

  if (sectionTitle) {
    const editWrapper = document.createElement("span");
    editWrapper.classList.add("edit-button");

    const editIcon = document.createElement("i");
    editIcon.classList.add("fa-regular", "fa-pen-to-square");

    const editText = document.createElement("span");
    editText.textContent = "modifier";

    editWrapper.appendChild(editIcon);
    editWrapper.appendChild(editText);

    sectionTitle.appendChild(editWrapper);
  }

  document.querySelector(".edit-button").addEventListener("click", openModal);

}


function openModal() {
  // empêche les duplications
  if (document.querySelector(".modal-overlay")) return;

  const modalHTML = `
  <div class="modal-overlay">
    <div class="modal">
      <span class="modal-close">&times;</span>
      <span class="modal-back hidden"><i class="fa-solid fa-arrow-left"></i></span>
      <div class="modal-gallery-view">
        <h3>Galerie photo</h3>
        <div class="modal-gallery"></div>
        <button class="modal-add-button">Ajouter une photo</button>
      </div>

      <div class="modal-form-view hidden">
        <h3>Ajout photo</h3>
        <form class="modal-form">
          <input type="file" name="image" />
          <input type="text" name="title" placeholder="Titre" />
          <select name="category">
            <option value="1">Objets</option>
            <option value="2">Appartements</option>
            <option value="3">Hôtels & restaurants</option>
          </select>
          <button type="submit">Valider</button>
        </form>
      </div>
    </div>
  </div>
`;
  document.body.insertAdjacentHTML("beforeend", modalHTML);

  const modalGalleryContainer = document.querySelector(".modal-gallery");
  modalGalleryContainer.innerHTML = ""; // on vide avant d'ajouter

  projects.forEach((project) => {
    const figure = document.createElement("figure");
    figure.classList.add("modal-project");

    const img = document.createElement("img");
    img.src = project.imageUrl;
    img.alt = project.title;

    const trash = document.createElement("i");
    trash.classList.add("fa-solid", "fa-trash-can");
    trash.dataset.id = project.id;

    trash.addEventListener("click", async (e) => {
      e.stopPropagation(); // évite de fermer la modale si on clique sur l’icône


      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`http://localhost:5678/api/works/${project.id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          // Supprimer l'élément de la modale
          figure.remove();

          // Supprimer aussi dans la galerie principale
          const galleryFigures = document.querySelectorAll(".gallery figure");
          galleryFigures.forEach((fig) => {
            const img = fig.querySelector("img");
            if (img && img.src === project.imageUrl) {
              fig.remove();
            }
          });

          // Mettre à jour le tableau `projects`
          const index = projects.findIndex((p) => p.id === project.id);
          if (index !== -1) {
            projects.splice(index, 1);
          }

        } else {
          alert("Erreur lors de la suppression.");
        }
      } catch (err) {
        console.error("Erreur:", err);
        alert("Une erreur est survenue.");
      }
    });

    figure.appendChild(img);
    figure.appendChild(trash);
    modalGalleryContainer.appendChild(figure);
  });

  // Ajoute les écouteurs
  document.querySelector(".modal-close").addEventListener("click", closeModal);
  document.querySelector(".modal-overlay").addEventListener("click", function (e) {
    if (e.target.classList.contains("modal-overlay")) closeModal();
  });

  document.querySelector(".modal-add-button").addEventListener("click", () => {
    document.querySelector(".modal-gallery-view").classList.add("hidden");
    document.querySelector(".modal-form-view").classList.remove("hidden");
    document.querySelector(".modal-back").classList.remove("hidden");
  });

  document.querySelector(".modal-back").addEventListener("click", () => {
    document.querySelector(".modal-form-view").classList.add("hidden");
    document.querySelector(".modal-gallery-view").classList.remove("hidden");
    document.querySelector(".modal-back").classList.add("hidden");
  });

  const imageInput = document.querySelector('input[type="file"]');
  const previewZone = document.createElement("div");
  previewZone.className = "image-preview";
  imageInput.parentNode.insertBefore(previewZone, imageInput.nextSibling);

  imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        previewZone.innerHTML = `<img src="${e.target.result}" style="max-width: 100%; max-height: 200px;" />`;
      };
      reader.readAsDataURL(file);
    }
  });

  document.querySelector(".modal-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const image = imageInput.files[0];
    const title = document.querySelector('input[name="title"]').value.trim();
    const category = document.querySelector('select[name="category"]').value;
    const token = localStorage.getItem("token");

    if (!image || !title || !category) {
      alert("Tous les champs sont obligatoires.");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);
    formData.append("title", title);
    formData.append("category", category);

    try {
      const response = await fetch("http://localhost:5678/api/works", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const newProject = await response.json();

        // Ajouter dans la galerie principale
        const gallery = document.querySelector(".gallery");
        const figure = document.createElement("figure");
        const img = document.createElement("img");
        img.src = newProject.imageUrl;
        img.alt = newProject.title;
        const figcaption = document.createElement("figcaption");
        figcaption.innerText = newProject.title;
        figure.appendChild(img);
        figure.appendChild(figcaption);
        gallery.appendChild(figure);

        // Ajouter dans la modale aussi
        projects.push(newProject);
        closeModal(); // ou reset du form + retour à la galerie

      } else {
        alert("Erreur lors de l'envoi du projet.");
      }
    } catch (err) {
      console.error("Erreur:", err);
      alert("Une erreur est survenue.");
    }
  });
}

function closeModal() {
  const modalOverlay = document.querySelector(".modal-overlay");
  if (modalOverlay) modalOverlay.remove();
}