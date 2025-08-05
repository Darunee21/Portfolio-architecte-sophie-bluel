export function generateProjects(projects) {
    const gallery = document.querySelector(".gallery");

    for (let i = 0; i < projects.length; i++) {
        const project = projects[i];

        const figure = document.createElement("figure");

        const image = document.createElement("img");
        image.src = project.imageUrl;
        image.alt = project.title;

        const caption = document.createElement("figcaption");
        caption.textContent = project.title;

        figure.appendChild(image);
        figure.appendChild(caption);
        gallery.appendChild(figure);
    }
}

export function generateFilters(categories) {
    const filters = document.querySelector(".filters");

    for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        const newButton = document.createElement("button");

        newButton.textContent = category.name;
        newButton.dataset.cat = category.id;
        filters.appendChild(newButton);
    }

}

export function generateFiltersEvent(projects) {
    const buttons = document.querySelectorAll(".filters button");
    buttons.forEach((button) => {
        button.addEventListener("click", function () {
            const categoryId = button.dataset.cat
            document.querySelector(".gallery").innerHTML = "";

            if (categoryId == "all") {
                generateProjects(projects)
            }
            else {
                const filteredProjects = []
                projects.forEach((pjt) => {
                    if (pjt.category.id == categoryId) {
                        filteredProjects.push(pjt)
                    }
                })
                generateProjects(filteredProjects)
            }
        });
    });

}