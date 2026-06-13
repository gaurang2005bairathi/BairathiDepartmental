/**
 * ============================================
 * DEPARTMENT STORE MANAGEMENT SYSTEM
 * Complete Frontend Application
 * ============================================
 */

// ============================================
// CONFIGURATION & CONSTANTS
// ============================================

const CONFIG = {
    STORAGE_KEY: 'departmentStoreProducts',
    ITEMS_PER_PAGE: 10,
    ANIMATION_DURATION: 300,
    LOCAL_STORAGE_KEY: 'theme_preference'
};

const SAMPLE_PRODUCTS = [
    {
        id: Date.now() - 5000,
        name: 'Cotton T-Shirt',
        category: 'Clothing',
        price: 299.99,
        quantity: 150,
        description: 'High quality cotton t-shirt available in multiple colors',
        dateAdded: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: Date.now() - 4000,
        name: 'Denim Jeans',
        category: 'Clothing',
        price: 1299.99,
        quantity: 85,
        description: 'Stylish denim jeans with perfect fit',
        dateAdded: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: Date.now() - 3000,
        name: 'Sports Shoes',
        category: 'Footwear',
        price: 2499.99,
        quantity: 60,
        description: 'Comfortable and durable sports shoes for running',
        dateAdded: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: Date.now() - 2000,
        name: 'Winter Jacket',
        category: 'Outerwear',
        price: 3999.99,
        quantity: 45,
        description: 'Warm and stylish winter jacket for cold weather',
        dateAdded: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: Date.now() - 1000,
        name: 'Sunglasses',
        category: 'Accessories',
        price: 899.99,
        quantity: 200,
        description: 'UV protection sunglasses with trendy design',
        dateAdded: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: Date.now(),
        name: 'Casual Backpack',
        category: 'Bags',
        price: 1499.99,
        quantity: 120,
        description: 'Spacious and lightweight backpack for daily use',
        dateAdded: new Date().toISOString()
    }
];

// ============================================
// STATE MANAGEMENT
// ============================================

let appState = {
    products: [],
    searchQuery: '',
    selectedCategory: '',
    sortBy: 'date-new',
    currentPage: 1,
    filteredProducts: [],
    editingId: null,
    deleteId: null
};

// ============================================
// DOM ELEMENTS CACHE
// ============================================

const DOM = {
    // Search & Filter
    searchInput: document.getElementById('searchInput'),
    categoryFilter: document.getElementById('categoryFilter'),
    sortSelect: document.getElementById('sortSelect'),

    // Table
    productsTableBody: document.getElementById('productsTableBody'),
    paginationList: document.getElementById('paginationList'),
    paginationContainer: document.getElementById('paginationContainer'),

    // Modals
    addProductModal: new bootstrap.Modal(document.getElementById('addProductModal')),
    deleteConfirmModal: new bootstrap.Modal(document.getElementById('deleteConfirmModal')),
    exportModal: new bootstrap.Modal(document.getElementById('exportModal')),
    importModal: new bootstrap.Modal(document.getElementById('importModal')),

    // Form
    productForm: document.getElementById('productForm'),
    productId: document.getElementById('productId'),
    productName: document.getElementById('productName'),
    productCategory: document.getElementById('productCategory'),
    productPrice: document.getElementById('productPrice'),
    productQuantity: document.getElementById('productQuantity'),
    productDescription: document.getElementById('productDescription'),
    saveProductBtn: document.getElementById('saveProductBtn'),
    modalTitle: document.getElementById('modalTitle'),

    // Dashboard
    totalProducts: document.getElementById('totalProducts'),
    inventoryValue: document.getElementById('inventoryValue'),
    totalCategories: document.getElementById('totalCategories'),
    totalStock: document.getElementById('totalStock'),
    recentProductsList: document.getElementById('recentProductsList'),
    recentCount: document.getElementById('recentCount'),
    avgPrice: document.getElementById('avgPrice'),
    lowStockCount: document.getElementById('lowStockCount'),
    popularCategory: document.getElementById('popularCategory'),

    // Action Buttons
    exportBtn: document.getElementById('exportBtn'),
    importBtn: document.getElementById('importBtn'),
    importFile: document.getElementById('importFile'),
    confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),
    resetData: document.getElementById('resetData'),

    // Delete confirmation
    deleteProductName: document.getElementById('deleteProductName'),

    // Theme
    themeToggle: document.getElementById('themeToggle'),

    // Toast
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage'),

    // Loading
    loadingOverlay: document.getElementById('loadingOverlay')
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Load products from localStorage
    loadProducts();

    // Initialize if first time or no products
    if (appState.products.length === 0) {
        appState.products = JSON.parse(JSON.stringify(SAMPLE_PRODUCTS));
        saveProducts();
    }

    // Initialize theme
    initializeTheme();

    // Setup event listeners
    setupEventListeners();

    // Initial render
    render();
}

// ============================================
// THEME MANAGEMENT
// ============================================

function initializeTheme() {
    const savedTheme = localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY) || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function updateThemeIcon(theme) {
    const icon = DOM.themeToggle.querySelector('i');
    if (theme === 'dark') {
        icon.classList.remove('bi-moon-stars');
        icon.classList.add('bi-sun');
    } else {
        icon.classList.remove('bi-sun');
        icon.classList.add('bi-moon-stars');
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY, newTheme);
    updateThemeIcon(newTheme);
    showToast(`Switched to ${newTheme.toUpperCase()} mode`, 'info');
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
    // Search & Filter
    DOM.searchInput.addEventListener('input', (e) => {
        appState.searchQuery = e.target.value.toLowerCase();
        appState.currentPage = 1;
        render();
    });

    DOM.categoryFilter.addEventListener('change', (e) => {
        appState.selectedCategory = e.target.value;
        appState.currentPage = 1;
        render();
    });

    DOM.sortSelect.addEventListener('change', (e) => {
        appState.sortBy = e.target.value;
        appState.currentPage = 1;
        render();
    });

    // Form
    DOM.saveProductBtn.addEventListener('click', saveProduct);
    DOM.productForm.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') saveProduct();
    });

    // Actions
    DOM.exportBtn.addEventListener('click', exportData);
    DOM.importBtn.addEventListener('click', importData);
    DOM.confirmDeleteBtn.addEventListener('click', confirmDelete);
    DOM.resetData.addEventListener('click', resetToSample);
    DOM.themeToggle.addEventListener('click', toggleTheme);

    // Modal cleanup
    document.getElementById('addProductModal').addEventListener('hidden.bs.modal', resetForm);
    document.getElementById('deleteConfirmModal').addEventListener('hidden.bs.modal', () => {
        appState.deleteId = null;
    });
}

// ============================================
// PRODUCT CRUD OPERATIONS
// ============================================

// Open modal for adding new product
function openAddProductModal() {
    appState.editingId = null;
    DOM.modalTitle.innerHTML = '<i class="bi bi-plus-circle"></i> Add New Product';
    DOM.saveProductBtn.innerHTML = '<i class="bi bi-check-circle"></i> Add Product';
    resetForm();
    DOM.addProductModal.show();
}

// Open modal for editing product
function openEditProductModal(id) {
    const product = appState.products.find(p => p.id === id);
    if (!product) return;

    appState.editingId = id;
    DOM.modalTitle.innerHTML = '<i class="bi bi-pencil-square"></i> Edit Product';
    DOM.saveProductBtn.innerHTML = '<i class="bi bi-check-circle"></i> Update Product';

    // Populate form
    DOM.productId.value = product.id;
    DOM.productName.value = product.name;
    DOM.productCategory.value = product.category;
    DOM.productPrice.value = product.price;
    DOM.productQuantity.value = product.quantity;
    DOM.productDescription.value = product.description;

    DOM.addProductModal.show();
}

// Save or update product
function saveProduct() {
    const name = DOM.productName.value.trim();
    const category = DOM.productCategory.value.trim();
    const price = parseFloat(DOM.productPrice.value);
    const quantity = parseInt(DOM.productQuantity.value);
    const description = DOM.productDescription.value.trim();

    // Validation
    if (!name || !category || !price || isNaN(quantity)) {
        showToast('Please fill all required fields', 'error');
        return;
    }

    if (price < 0 || quantity < 0) {
        showToast('Price and Quantity cannot be negative', 'error');
        return;
    }

    if (appState.editingId) {
        // Update existing product
        const productIndex = appState.products.findIndex(p => p.id === appState.editingId);
        if (productIndex > -1) {
            appState.products[productIndex] = {
                ...appState.products[productIndex],
                name,
                category,
                price,
                quantity,
                description
            };
            showToast(`Product "${name}" updated successfully!`, 'success');
        }
    } else {
        // Add new product
        const newProduct = {
            id: Date.now(),
            name,
            category,
            price,
            quantity,
            description,
            dateAdded: new Date().toISOString()
        };
        appState.products.push(newProduct);
        showToast(`Product "${name}" added successfully!`, 'success');
    }

    saveProducts();
    DOM.addProductModal.hide();
    appState.currentPage = 1;
    render();
}

// Delete product
function openDeleteModal(id) {
    const product = appState.products.find(p => p.id === id);
    if (!product) return;

    appState.deleteId = id;
    DOM.deleteProductName.textContent = product.name;
    DOM.deleteConfirmModal.show();
}

function confirmDelete() {
    if (!appState.deleteId) return;

    const product = appState.products.find(p => p.id === appState.deleteId);
    appState.products = appState.products.filter(p => p.id !== appState.deleteId);

    showToast(`Product "${product.name}" deleted successfully!`, 'success');
    saveProducts();
    DOM.deleteConfirmModal.hide();
    appState.currentPage = 1;
    render();
}

// Reset form
function resetForm() {
    DOM.productForm.reset();
    DOM.productId.value = '';
    appState.editingId = null;
}

// ============================================
// SEARCH, FILTER & SORT
// ============================================

function getFilteredAndSortedProducts() {
    let filtered = [...appState.products];

    // Search filter
    if (appState.searchQuery) {
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(appState.searchQuery)
        );
    }

    // Category filter
    if (appState.selectedCategory) {
        filtered = filtered.filter(p => p.category === appState.selectedCategory);
    }

    // Sorting
    switch (appState.sortBy) {
        case 'name-asc':
            filtered.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            filtered.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'price-asc':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filtered.sort((a, b) => b.price - a.price);
            break;
        case 'date-new':
        default:
            filtered.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    }

    return filtered;
}

// ============================================
// PAGINATION
// ============================================

function getPaginatedProducts(products) {
    const start = (appState.currentPage - 1) * CONFIG.ITEMS_PER_PAGE;
    const end = start + CONFIG.ITEMS_PER_PAGE;
    return products.slice(start, end);
}

function getTotalPages(products) {
    return Math.ceil(products.length / CONFIG.ITEMS_PER_PAGE);
}

function renderPagination(totalProducts) {
    const totalPages = getTotalPages(totalProducts);

    if (totalPages <= 1) {
        DOM.paginationContainer.classList.add('d-none');
        return;
    }

    DOM.paginationContainer.classList.remove('d-none');
    DOM.paginationList.innerHTML = '';

    // Previous button
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${appState.currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `<a class="page-link" href="#" onclick="goToPage(${appState.currentPage - 1})">
        <i class="bi bi-chevron-left"></i> Previous
    </a>`;
    DOM.paginationList.appendChild(prevLi);

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${appState.currentPage === i ? 'active' : ''}`;
        li.innerHTML = `<a class="page-link" href="#" onclick="goToPage(${i})">${i}</a>`;
        DOM.paginationList.appendChild(li);
    }

    // Next button
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${appState.currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `<a class="page-link" href="#" onclick="goToPage(${appState.currentPage + 1})">
        Next <i class="bi bi-chevron-right"></i>
    </a>`;
    DOM.paginationList.appendChild(nextLi);
}

function goToPage(page) {
    const totalPages = getTotalPages(appState.filteredProducts);
    if (page < 1 || page > totalPages) return;
    appState.currentPage = page;
    render();
}

// ============================================
// TABLE RENDERING
// ============================================

function renderProductsTable() {
    appState.filteredProducts = getFilteredAndSortedProducts();
    const paginatedProducts = getPaginatedProducts(appState.filteredProducts);

    if (appState.filteredProducts.length === 0) {
        DOM.productsTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-5 text-muted">
                    <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                    No products found
                </td>
            </tr>
        `;
        DOM.paginationContainer.classList.add('d-none');
        return;
    }

    DOM.productsTableBody.innerHTML = paginatedProducts.map(product => `
        <tr>
            <td>
                <strong>${escapeHtml(product.name)}</strong>
            </td>
            <td>
                <span class="badge bg-info">${escapeHtml(product.category)}</span>
            </td>
            <td>
                <strong>₹${product.price.toFixed(2)}</strong>
            </td>
            <td>
                <span class="badge ${product.quantity < 50 ? 'bg-warning' : 'bg-success'}">
                    ${product.quantity} units
                </span>
            </td>
            <td>
                <small>${formatDate(product.dateAdded)}</small>
            </td>
            <td>
                <button class="btn action-btn action-btn-edit" onclick="openEditProductModal(${product.id})">
                    <i class="bi bi-pencil"></i> Edit
                </button>
                <button class="btn action-btn action-btn-delete" onclick="openDeleteModal(${product.id})">
                    <i class="bi bi-trash"></i> Delete
                </button>
            </td>
        </tr>
    `).join('');

    renderPagination(appState.filteredProducts);
}

// ============================================
// DASHBOARD RENDERING
// ============================================

function renderDashboard() {
    // Total Products
    DOM.totalProducts.textContent = appState.products.length;

    // Inventory Value
    const inventoryValue = appState.products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    DOM.inventoryValue.textContent = `₹${inventoryValue.toFixed(2)}`;

    // Total Categories
    const categories = new Set(appState.products.map(p => p.category));
    DOM.totalCategories.textContent = categories.size;

    // Total Stock
    const totalStock = appState.products.reduce((sum, p) => sum + p.quantity, 0);
    DOM.totalStock.textContent = totalStock;

    // Recent Products
    renderRecentProducts();

    // Quick Stats
    renderQuickStats();

    // Update category filter options
    updateCategoryFilter();
}

function renderRecentProducts() {
    const recent = [...appState.products]
        .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
        .slice(0, 5);

    if (recent.length === 0) {
        DOM.recentProductsList.innerHTML = '<p class="text-muted text-center py-4">No products yet</p>';
        DOM.recentCount.textContent = '0';
        return;
    }

    DOM.recentCount.textContent = recent.length;
    DOM.recentProductsList.innerHTML = recent.map(product => `
        <div class="recent-product-item">
            <div class="recent-product-name">${escapeHtml(product.name)}</div>
            <div class="recent-product-meta">
                <i class="bi bi-tag"></i> ${escapeHtml(product.category)} • 
                <i class="bi bi-currency-rupee"></i> ${product.price.toFixed(2)} • 
                Stock: ${product.quantity}
            </div>
        </div>
    `).join('');
}

function renderQuickStats() {
    // Average Price
    const avgPrice = appState.products.length > 0
        ? appState.products.reduce((sum, p) => sum + p.price, 0) / appState.products.length
        : 0;
    DOM.avgPrice.textContent = `₹${avgPrice.toFixed(2)}`;

    // Low Stock Items (less than 50 units)
    const lowStock = appState.products.filter(p => p.quantity < 50).length;
    DOM.lowStockCount.textContent = lowStock;

    // Most Popular Category
    if (appState.products.length > 0) {
        const categories = {};
        appState.products.forEach(p => {
            categories[p.category] = (categories[p.category] || 0) + 1;
        });
        const mostPopular = Object.keys(categories).reduce((a, b) =>
            categories[a] > categories[b] ? a : b
        );
        DOM.popularCategory.textContent = mostPopular;
    } else {
        DOM.popularCategory.textContent = 'N/A';
    }
}

function updateCategoryFilter() {
    const categories = [...new Set(appState.products.map(p => p.category))].sort();
    const currentValue = DOM.categoryFilter.value;

    DOM.categoryFilter.innerHTML = '<option value="">All Categories</option>';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        DOM.categoryFilter.appendChild(option);
    });

    DOM.categoryFilter.value = currentValue;
}

// ============================================
// EXPORT & IMPORT DATA
// ============================================

function exportData() {
    const dataStr = JSON.stringify(appState.products, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `store-products-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Data exported successfully!', 'success');
    DOM.exportModal.hide();
}

function importData() {
    const file = DOM.importFile.files[0];
    if (!file) {
        showToast('Please select a file', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const imported = JSON.parse(e.target.result);

            // Validate imported data
            if (!Array.isArray(imported)) {
                throw new Error('Invalid format: must be an array of products');
            }

            // Merge or replace
            const confirmMerge = confirm(
                'Do you want to MERGE with existing data?\n\nClick "OK" to merge or "Cancel" to replace.'
            );

            if (confirmMerge) {
                // Merge: add imported products with new IDs
                const merged = imported.map(p => ({
                    ...p,
                    id: Date.now() + Math.random() // Ensure unique IDs
                }));
                appState.products = [...appState.products, ...merged];
            } else {
                // Replace existing data
                appState.products = imported;
            }

            saveProducts();
            render();
            DOM.importFile.value = '';
            showToast(`Imported ${imported.length} products successfully!`, 'success');
            DOM.importModal.hide();
        } catch (error) {
            showToast(`Import failed: ${error.message}`, 'error');
        }
    };

    reader.readAsText(file);
}

// ============================================
// RESET TO SAMPLE DATA
// ============================================

function resetToSample() {
    const confirmed = confirm(
        'This will replace all data with sample products.\n\nThis action cannot be undone. Continue?'
    );

    if (confirmed) {
        appState.products = JSON.parse(JSON.stringify(SAMPLE_PRODUCTS));
        appState.currentPage = 1;
        appState.searchQuery = '';
        appState.selectedCategory = '';
        appState.sortBy = 'date-new';

        DOM.searchInput.value = '';
        DOM.categoryFilter.value = '';
        DOM.sortSelect.value = 'date-new';

        saveProducts();
        render();
        showToast('Data reset to sample products!', 'success');
    }
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

function showToast(message, type = 'info') {
    DOM.toastMessage.textContent = message;

    // Remove previous type classes
    DOM.toast.classList.remove('success', 'error', 'warning', 'info');
    DOM.toast.classList.add(type);

    // Show toast
    const toast = new bootstrap.Toast(DOM.toast);
    toast.show();
}

// ============================================
// LOCALSTORAGE MANAGEMENT
// ============================================

function saveProducts() {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(appState.products));
}

function loadProducts() {
    const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
    appState.products = stored ? JSON.parse(stored) : [];
}

// ============================================
// MAIN RENDER FUNCTION
// ============================================

function render() {
    renderDashboard();
    renderProductsTable();
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format date to readable format
 */
function formatDate(isoString) {
    const date = new Date(isoString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-IN', options);
}

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// ============================================
// GLOBAL FUNCTIONS FOR HTML ONCLICK HANDLERS
// ============================================

window.openAddProductModal = openAddProductModal;
window.openEditProductModal = openEditProductModal;
window.openDeleteModal = openDeleteModal;
window.confirmDelete = confirmDelete;
window.goToPage = goToPage;
window.exportData = exportData;
window.importData = importData;
window.resetToSample = resetToSample;
window.toggleTheme = toggleTheme;
