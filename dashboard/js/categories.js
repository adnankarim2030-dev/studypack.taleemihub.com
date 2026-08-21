/* ============================================================
   Categories module — now persisted to Firestore (previously
   an in-memory array that reset on every page refresh).
   ============================================================ */

window.renderCategories = function() {
    const tbody = document.getElementById('categoriesTableBody');
    if (!tbody) return;

    const categories = window.AppData.categories || [];
    const products = window.AppData.products || [];

    if (categories.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4"><div class="empty-state"><i data-lucide="tags"></i><p>No categories yet</p></div></td></tr>`;
        lucide.createIcons();
        return;
    }

    tbody.innerHTML = categories.map(c => {
        const count = products.filter(p =>
            p.category === c.name || p.cls === c.name || p.subj === c.name
        ).length;
        return `
        <tr>
            <td style="font-weight:600;">${escapeHtml(c.name)}</td>
            <td><span class="badge badge-info">${escapeHtml(c.type || 'category')}</span></td>
            <td>${count}</td>
            <td style="text-align:right;">
                <button class="icon-btn-sm" onclick="openCategoryModal('${c._docId}')" title="Edit"><i data-lucide="edit-2"></i></button>
                <button class="icon-btn-sm danger" onclick="deleteCategory('${c._docId}')" title="Delete"><i data-lucide="trash-2"></i></button>
            </td>
        </tr>`;
    }).join('');
    lucide.createIcons();
};

window.openCategoryModal = function(docId) {
    document.getElementById('categoryForm').reset();
    document.getElementById('categoryDocId').value = '';

    if (docId) {
        const c = (window.AppData.categories || []).find(x => x._docId === docId);
        if (c) {
            document.getElementById('categoryModalTitle').textContent = 'Edit Category';
            document.getElementById('categoryDocId').value = docId;
            document.getElementById('categoryName').value = c.name || '';
            document.getElementById('categoryType').value = c.type || 'category';
        }
    } else {
        document.getElementById('categoryModalTitle').textContent = 'Add Category';
    }
    document.getElementById('categoryModal').classList.add('show');
};

window.closeCategoryModal = function() {
    document.getElementById('categoryModal').classList.remove('show');
};

document.getElementById('categoryForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    try {
        const docId = document.getElementById('categoryDocId').value;
        const data = {
            name: document.getElementById('categoryName').value.trim(),
            type: document.getElementById('categoryType').value
        };
        if (!data.name) throw new Error('Name is required');

        if (docId) {
            await db.collection('categories').doc(docId).set(data, { merge: true });
        } else {
            await db.collection('categories').add(data);
        }
        showToast('Category saved');
        closeCategoryModal();
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
    }
});

window.deleteCategory = async function(docId) {
    if (!confirm('Delete this category?')) return;
    try {
        await db.collection('categories').doc(docId).delete();
        showToast('Category deleted');
    } catch (e) {
        showToast('Error: ' + e.message, 'error');
    }
};
