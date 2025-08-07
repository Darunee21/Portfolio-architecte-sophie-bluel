/**
 * Génère dynamiquement la galerie des projets sur la page d'accueil.
 * @param {Array} projects - Tableau des projets à afficher.
 */
export function generateProjects(projects) {
  const gallery = document.querySelector(".gallery");

  projects.forEach((project) => {
    const figure = document.createElement("figure");

    const image = document.createElement("img");
    image.src = project.imageUrl;
    image.alt = project.title;

    const caption = document.createElement("figcaption");
    caption.textContent = project.title;

    figure.appendChild(image);
    figure.appendChild(caption);
    gallery.appendChild(figure);
  });
}

/**
 * Génère dynamiquement les boutons de filtre à partir des catégories récupérées via l’API.
 * @param {Array} categories - Tableau des catégories disponibles.
 */
export function generateFilters(categories) {
  const filters = document.querySelector(".filters");

  categories.forEach((category) => {
    const newButton = document.createElement("button");
    newButton.textContent = category.name;
    newButton.dataset.cat = category.id;
    filters.appendChild(newButton);
  });
}

/**
 * Associe un événement de filtrage à chaque bouton de filtre,
 * puis filtre les projets affichés en fonction de la catégorie sélectionnée.
 * @param {Array} projects - Tableau complet des projets pour appliquer les filtres.
 */
export function generateFiltersEvent(projects) {
  const buttons = document.querySelectorAll(".filters button");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const categoryId = button.dataset.cat;
      const gallery = document.querySelector(".gallery");
      gallery.innerHTML = "";

      if (categoryId === "all") {
        generateProjects(projects);
      } else {
        const filteredProjects = projects.filter(
          (project) => project.category.id == categoryId
        );
        generateProjects(filteredProjects);
      }
    });
  });
}