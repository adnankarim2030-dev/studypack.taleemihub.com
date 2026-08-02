document.addEventListener("DOMContentLoaded", () => {
    if (typeof SCRAPED_COURSES === 'undefined') {
        console.error("SCRAPED_COURSES is not defined! Ensure scraped-courses.js is loaded.");
        return;
    }

    const schoolGrid = document.getElementById("schoolGrid");
    const classSelectorWrapper = document.getElementById("classSelectorWrapper");
    const selectedSchoolNameEl = document.getElementById("selectedSchoolName");
    const classPills = document.getElementById("classPills");
    const courseProductsContainer = document.getElementById("courseProductsContainer");
    const courseProductGrid = document.getElementById("courseProductGrid");
    const productSectionTitle = document.getElementById("productSectionTitle");

    // Extract unique schools
    const schools = [...new Set(SCRAPED_COURSES.map(c => c.school))];

    // Helper: generate initials
    const getInitials = (name) => {
        let parts = name.trim().split(" ");
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
    };

    // Render schools
    schools.forEach(school => {
        const div = document.createElement("div");
        div.className = "school-card reveal active-scale";
        
        const avatar = document.createElement("div");
        avatar.className = "school-avatar";
        avatar.textContent = getInitials(school);

        const nameEl = document.createElement("div");
        nameEl.className = "school-name";
        nameEl.textContent = school;

        div.appendChild(avatar);
        div.appendChild(nameEl);

        div.addEventListener("click", () => {
            // Remove active from others
            document.querySelectorAll(".school-card").forEach(c => c.classList.remove("active"));
            div.classList.add("active");
            openSchool(school);
        });

        schoolGrid.appendChild(div);
    });

    let currentSchool = null;

    function openSchool(school) {
        currentSchool = school;
        selectedSchoolNameEl.textContent = `${school} Classes`;
        classSelectorWrapper.classList.add("visible");
        
        // Hide products until a class is selected
        courseProductsContainer.style.display = "none";
        
        // Find classes for this school
        const schoolCourses = SCRAPED_COURSES.filter(c => c.school === school);
        const classes = [...new Set(schoolCourses.map(c => c.class_name))].sort();

        classPills.innerHTML = "";
        
        if(classes.length === 0) {
            classPills.innerHTML = "<i>No classes found for this school.</i>";
            return;
        }

        classes.forEach(cls => {
            const btn = document.createElement("button");
            btn.className = "class-pill";
            btn.textContent = cls;
            btn.addEventListener("click", () => {
                document.querySelectorAll(".class-pill").forEach(p => p.classList.remove("active"));
                btn.classList.add("active");
                renderProducts(school, cls);
            });
            classPills.appendChild(btn);
        });
        
        // Auto select first class if there is one
        if(classPills.firstElementChild) {
            classPills.firstElementChild.click();
        }

        // Scroll to class selector
        classSelectorWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function renderProducts(school, cls) {
        productSectionTitle.textContent = `${school} - ${cls}`;
        courseProductsContainer.style.display = "block";
        courseProductGrid.innerHTML = "";

        const products = SCRAPED_COURSES.filter(c => c.school === school && c.class_name === cls);

        if (products.length === 0) {
            courseProductGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <h3>No Books Found</h3>
                    <p>We couldn't find any books for this specific class.</p>
                </div>
            `;
            return;
        }

        products.forEach(p => {
            const card = document.createElement("div");
            card.className = "product-card fade-in";
            
            let imgHtml = p.img ? `<img src="${p.img}" alt="${p.title}" loading="lazy">` 
                                : `<div class="placeholder-img" style="height:200px; background:#f1f5f9; display:flex; align-items:center; justify-content:center; color:#94a3b8;"><svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`;
                                
            card.innerHTML = `
                <div class="pc-img">
                    ${imgHtml}
                    <span class="pc-badge">${p.type || 'Course'}</span>
                </div>
                <div class="pc-info">
                    <div class="pc-cat">${p.school}</div>
                    <div class="pc-title">${p.title}</div>
                    <div class="pc-bot">
                        <div class="pc-price">Rs ${p.price.toLocaleString()}</div>
                        <button class="add-to-cart" onclick="window.addToCart('${p.id}', '${p.title.replace(/'/g, "\\'")}', ${p.price}, '${p.img}')">Add</button>
                    </div>
                </div>
            `;
            courseProductGrid.appendChild(card);
        });
        
        courseProductsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Export global so the inline onclick in HTML can use it
    window.closeSchool = function() {
        classSelectorWrapper.classList.remove("visible");
        courseProductsContainer.style.display = "none";
        document.querySelectorAll(".school-card").forEach(c => c.classList.remove("active"));
        currentSchool = null;
    };
});
