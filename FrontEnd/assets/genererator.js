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
 * Active le bon style de filtre et met à jour la galerie selon la catégorie.
 * Un seul listner sur .filters
 * aussi pour les boutons ajoutés dynamiquement.
 *
 * @param {Array} projects - Tous les projets disponibles (non filtrés).
 */
export function generateFiltersEvent(projects) {
    const filters = document.querySelector(".filters");
    if (!filters) return;

    filters.addEventListener("click", (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;

        filters.querySelectorAll("button").forEach((b) => b.classList.remove("filter-selected"));
        btn.classList.add("filter-selected");

        const categoryId = btn.dataset.cat;
        const gallery = document.querySelector(".gallery");
        gallery.innerHTML = "";

        if (categoryId === "all") {
            generateProjects(projects);
        } else {
            const filtered = projects.filter((p) => String(p.category.id) === String(categoryId));
            generateProjects(filtered);
        }
    });
}