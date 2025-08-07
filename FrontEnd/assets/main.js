import { generateProjects, generateFilters, generateFiltersEvent } from "./genererator.js";

let projects = [];

/**
 * Initialise l'application en récupérant les projets et les catégories depuis l'API.
 * Initialise l'interface admin si le token est présent.
 */
async function initApp() {
  await fetchProjects();
  await fetchCategories();
  initAdminInterface();
}

/**
 * Récupère les projets depuis l'API et les injecte dans le DOM.
 */
async function fetchProjects() {
  try {
    const response = await fetch("http://localhost:5678/api/works");
    const data = await response.json();
    generateProjects(data);
    projects = data;
  } catch (error) {
    console.error("Erreur lors de la récupération des projets:", error);
  }
}

/**
 * Récupère les catégories depuis l'API et initialise les filtres.
 */
async function fetchCategories() {
  try {
    const response = await fetch("http://localhost:5678/api/categories");
    const data = await response.json();
    generateFilters(data);
    generateFiltersEvent(projects);
  } catch (error) {
    console.error("Erreur lors de la récupération des filtres:", error);
  }
}

/**
 * Initialise les éléments de l'interface admin si l'utilisateur est connecté.
 */
function initAdminInterface() {
  const token = localStorage.getItem("token");
  if (!token) return;

  displayEditionBanner();
  transformLoginToLogout();
  hideFilters();
  addEditButton();
}

/** Affiche la bannière mode édition en haut de page. */
function displayEditionBanner() {
  const banner = document.createElement("div");
  banner.classList.add("edition-banner");
  banner.innerHTML = `<i class="fa-regular fa-pen-to-square"></i><span>Mode édition</span>`;
  document.body.insertBefore(banner, document.body.firstChild);
}

/** Remplace le lien login par logout et gère sa logique. */
function transformLoginToLogout() {
  const loginItem = document.querySelector("nav li:nth-child(3)");
  loginItem.textContent = "logout";
  loginItem.style.cursor = "pointer";
  loginItem.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.reload();
  });
}

/** Masque les filtres de la galerie. */
function hideFilters() {
  const filters = document.querySelector(".filters");
  if (filters) filters.style.display = "none";
}

/** Ajoute le bouton "modifier" et gère l'ouverture de la modale. */
function addEditButton() {
  const sectionTitle = document.querySelector("#portfolio h2");
  if (!sectionTitle) return;

  const editWrapper = document.createElement("span");
  editWrapper.classList.add("edit-button");
  editWrapper.innerHTML = `<i class="fa-regular fa-pen-to-square"></i><span>modifier</span>`;
  sectionTitle.appendChild(editWrapper);

  editWrapper.addEventListener("click", openModal);
}

/** Ferme la modale ouverte. */
function closeModal() {
  const modalOverlay = document.querySelector(".modal-overlay");
  if (modalOverlay) modalOverlay.remove();
}

/**
 * Crée et affiche la modale (galerie + formulaire).
 */
function openModal() {
  if (document.querySelector(".modal-overlay")) return; // évite les doublons

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
          <select name="category"></select>
          <button type="submit">Valider</button>
        </form>
      </div>
    </div>
  </div>`;

  document.body.insertAdjacentHTML("beforeend", modalHTML);
  renderModalGallery();
  setupModalEvents();
  fetchAndRenderCategories();
  setupImagePreview();
  handleFormSubmission();
}

/** Injecte les projets dans la galerie de la modale avec icône suppression. */
function renderModalGallery() {
  const container = document.querySelector(".modal-gallery");
  container.innerHTML = "";

  projects.forEach((project) => {
    const figure = document.createElement("figure");
    figure.className = "modal-project";
    figure.innerHTML = `<img src="${project.imageUrl}" alt="${project.title}"><i class="fa-solid fa-trash-can" data-id="${project.id}"></i>`;

    figure.querySelector(".fa-trash-can").addEventListener("click", () => handleDelete(project.id, figure));

    container.appendChild(figure);
  });
}

/** Gère la suppression d'un projet via l'API et le DOM. */
async function handleDelete(projectId, figureElement) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:5678/api/works/${projectId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      figureElement.remove();
      document.querySelectorAll(".gallery figure").forEach((fig) => {
        const img = fig.querySelector("img");
        if (img?.src.includes(projectId)) fig.remove();
      });
      projects = projects.filter((p) => p.id !== projectId);
    } else alert("Erreur lors de la suppression.");
  } catch (err) {
    console.error("Erreur:", err);
    alert("Une erreur est survenue.");
  }
}

/** Ajoute les événements pour la fermeture de la modale, navigation et formulaire. */
function setupModalEvents() {
  document.querySelector(".modal-close").addEventListener("click", closeModal);
  document.querySelector(".modal-overlay").addEventListener("click", (e) => {
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
}

/**
 * Récupère les catégories de l'API et les injecte dans le select.
 */
async function fetchAndRenderCategories() {
  try {
    const response = await fetch("http://localhost:5678/api/categories");
    const categories = await response.json();
    const select = document.querySelector("select[name='category']");
    select.innerHTML = categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join("");
  } catch (err) {
    console.error("Erreur catégories:", err);
  }
}

/** Affiche un aperçu de l'image sélectionnée. */
function setupImagePreview() {
  const imageInput = document.querySelector("input[type='file']");
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
}

/** Gère l'envoi du formulaire et mise à jour du DOM si succès. */
function handleFormSubmission() {
  document.querySelector(".modal-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const image = document.querySelector("input[type='file']").files[0];
    const title = document.querySelector("input[name='title']").value.trim();
    const category = document.querySelector("select[name='category']").value;
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
        projects.push(newProject);
        generateProjects(projects); // met à jour la galerie
        closeModal();
      } else {
        alert("Erreur lors de l'envoi du projet.");
      }
    } catch (err) {
      console.error("Erreur:", err);
      alert("Une erreur est survenue.");
    }
  });
}

// Initialise l'app au chargement
initApp();