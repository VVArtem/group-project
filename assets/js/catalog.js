let allProducts = [];
let filteredProducts = [];
let allCategories = [];

let currentPage = 1;
const itemsPerPage = 12;

let activeFilters = {
    category: null,
    priceMin: null,
    priceMax: null,
    searchQuery: null,
    page: 1,
    params: {}
};
let currentSort = 'popular';


async function initCatalog() {
    try {
        const response = await fetch('assets/bd/catalog.json');
        const data = await response.json();
        allProducts = data.products;
        allCategories = data.categories;
        renderCategories(allCategories);
        renderDynamicFilters(data.filters);
        setupEventListeners();
        readStateFromURL();
        syncUIWithState();
        applyFiltersAndSort();
    } catch (error) { }
}

function syncUIWithState() {
    const priceMinInput = document.getElementById('price-min');
    const priceMaxInput = document.getElementById('price-max');
    if (priceMinInput && activeFilters.priceMin) priceMinInput.value = activeFilters.priceMin;
    if (priceMaxInput && activeFilters.priceMax) priceMaxInput.value = activeFilters.priceMax;
    const sortSelect = document.getElementById('sort');
    if (sortSelect) sortSelect.value = currentSort;
    if (activeFilters.category) {
        const activeCatLink = document.querySelector(`.category-link[data-id="${activeFilters.category}"]`);
        if (activeCatLink) activeCatLink.classList.add('font-medium', 'text-primary');
    }
    document.querySelectorAll('.dynamic-checkbox').forEach(cb => {
        const filterName = cb.getAttribute('data-filter');
        const filterValue = cb.value;
        if (activeFilters.params[filterName] && activeFilters.params[filterName].includes(filterValue)) {
            cb.checked = true;
        }
    });
}

function applyFiltersAndSort() {
    let result = [...allProducts];
    if (activeFilters.category) {
        result = result.filter(p => p.categoryId === activeFilters.category);
    }
    if (activeFilters.searchQuery) {
        const query = activeFilters.searchQuery.toLowerCase().trim();
        result = result.filter(p =>
            p.name.toLowerCase().includes(query) || (p.vendor && p.vendor.toLowerCase().includes(query))
        );
    }
    if (activeFilters.priceMin !== null) {
        result = result.filter(p => p.price >= activeFilters.priceMin);
    }
    if (activeFilters.priceMax !== null) {
        result = result.filter(p => p.price <= activeFilters.priceMax);
    }
    for (const [paramName, selectedValues] of Object.entries(activeFilters.params)) {
        if (selectedValues.length > 0) {
            if (paramName === 'Бренд') {
                result = result.filter(p => selectedValues.includes(p.vendor));
            } else {
                result = result.filter(p => p.params && selectedValues.includes(p.params[paramName]));
            }
        }
    }
    if (currentSort === 'price_asc') {
        result.sort((a, b) => a.price - b.price);
    }
    else if (currentSort === 'price_desc') {
        result.sort((a, b) => b.price - a.price);
    }
    else if (currentSort === 'new') {
        result.sort((a, b) => {
            const idA = parseInt(a.id) || 0;
            const idB = parseInt(b.id) || 0;
            return idB - idA;
        });
    }
    else {
    }

    filteredProducts = result;

    const countElement = document.getElementById('products-count');
    if (countElement) {
        countElement.textContent = filteredProducts.length.toLocaleString('uk-UA');
    }
    renderProductsGrid(filteredProducts, itemsPerPage, currentPage);
    renderPagination();
}

function renderPagination() {
    const container = document.getElementById('pagination-container');
    if (!container) return;
    container.innerHTML = '';

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    if (totalPages <= 1) return;
    const prevDisabled = currentPage === 1 ? 'disabled opacity-50 cursor-not-allowed' : 'hover:bg-gray-50';
    container.insertAdjacentHTML('beforeend', `<button onclick="goToPage(${currentPage - 1})" class="px-3 py-1 mx-1 rounded border border-gray-300 text-gray-500 ${prevDisabled}" ${currentPage === 1 ? 'disabled' : ''}>Попередня</button>`);

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
        container.insertAdjacentHTML('beforeend', `<button onclick="goToPage(1)" class="px-3 py-1 mx-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50">1</button>`);
        if (startPage > 2) container.insertAdjacentHTML('beforeend', `<span class="px-2 text-gray-500">...</span>`);
    }

    for (let i = startPage; i <= endPage; i++) {
        const activeClass = i === currentPage
            ? 'border-primary bg-primary text-white'
            : 'border-gray-300 text-gray-700 hover:bg-gray-50';
        container.insertAdjacentHTML('beforeend', `<button onclick="goToPage(${i})" class="px-3 py-1 mx-1 rounded border ${activeClass}">${i}</button>`);
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) container.insertAdjacentHTML('beforeend', `<span class="px-2 text-gray-500">...</span>`);
        container.insertAdjacentHTML('beforeend', `<button onclick="goToPage(${totalPages})" class="px-3 py-1 mx-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50">${totalPages}</button>`);
    }

    const nextDisabled = currentPage === totalPages ? 'disabled opacity-50 cursor-not-allowed' : 'hover:bg-gray-50';
    container.insertAdjacentHTML('beforeend', `<button onclick="goToPage(${currentPage + 1})" class="px-3 py-1 mx-1 rounded border border-gray-300 text-gray-500 ${nextDisabled}" ${currentPage === totalPages ? 'disabled' : ''}>Наступна</button>`);
}

function goToPage(page) {
    currentPage = page;
    renderProductsGrid(filteredProducts, itemsPerPage, currentPage);
    renderPagination();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderCategories(categories) {
    const list = document.getElementById('categories-list');
    if (!list) return;
    list.innerHTML = '';
    categories.forEach(cat => {
        const count = allProducts.filter(p => p.categoryId === cat.id).length;
        const li = `
            <li>
                <a href="#" onclick="selectCategory(event, '${cat.id}')" class="category-link flex justify-between hover:text-primary transition py-1" data-id="${cat.id}">
                    <span>${cat.name}</span>
                    <span class="text-gray-400">(${count})</span>
                </a>
            </li>`;
        list.insertAdjacentHTML('beforeend', li);
    });
}

function selectCategory(event, categoryId) {
    event.preventDefault();
    document.querySelectorAll('.category-link').forEach(link => {
        link.classList.remove('font-medium', 'text-primary');
    });
    if (activeFilters.category === categoryId) {
        activeFilters.category = null;
    } else {
        activeFilters.category = categoryId;
        event.currentTarget.classList.add('font-medium', 'text-primary');
    }
    currentPage = 1;
    applyFiltersAndSort();
}

function renderDynamicFilters(filters) {
    const container = document.getElementById('dynamic-filters');
    if (!container) return;
    container.innerHTML = '';
    for (const [filterName, filterValues] of Object.entries(filters)) {
        if (!filterValues || filterValues.length === 0) continue;
        let checkboxesHTML = '';
        filterValues.forEach(value => {
            checkboxesHTML += `
                <label class="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" data-filter="${filterName}" value="${value}" class="dynamic-checkbox rounded text-primary focus:ring-primary w-4 h-4 border-gray-300">
                    <span class="text-sm text-gray-600">${value}</span>
                </label>
            `;
        });
        const filterBlockHTML = `
            <div class="mb-6 border-t border-gray-100 pt-4">
                <h3 class="font-semibold text-gray-800 mb-3">${filterName}</h3>
                <div class="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    ${checkboxesHTML}
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', filterBlockHTML);
    }
}


function setupEventListeners() {
    const sortSelect = document.getElementById('sort');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            currentPage = 1;
            applyFiltersAndSort();
        });
    }

    const priceMin = document.getElementById('price-min');
    const priceMax = document.getElementById('price-max');

    const applyPriceFilter = () => {
        activeFilters.priceMin = priceMin.value ? parseFloat(priceMin.value) : null;
        activeFilters.priceMax = priceMax.value ? parseFloat(priceMax.value) : null;
        currentPage = 1;
        applyFiltersAndSort();
    };

    if (priceMin) priceMin.addEventListener('input', applyPriceFilter);
    if (priceMax) priceMax.addEventListener('input', applyPriceFilter);


    const dynamicFiltersContainer = document.getElementById('dynamic-filters');
    if (dynamicFiltersContainer) {
        dynamicFiltersContainer.addEventListener('change', (e) => {
            if (e.target.classList.contains('dynamic-checkbox')) {
                const filterName = e.target.getAttribute('data-filter');
                const filterValue = e.target.value;

                if (!activeFilters.params[filterName]) {
                    activeFilters.params[filterName] = [];
                }

                if (e.target.checked) {
                    activeFilters.params[filterName].push(filterValue);
                } else {
                    activeFilters.params[filterName] = activeFilters.params[filterName].filter(v => v !== filterValue);
                }

                currentPage = 1;
                applyFiltersAndSort();
            }
        });
    }


    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            window.history.replaceState({}, document.title, window.location.pathname);
            activeFilters = { category: null, priceMin: null, priceMax: null, params: {} };
            currentPage = 1;
            if (priceMin) priceMin.value = '';
            if (priceMax) priceMax.value = '';
            document.querySelectorAll('.dynamic-checkbox').forEach(cb => cb.checked = false);
            document.querySelectorAll('.category-link').forEach(link => link.classList.remove('font-medium', 'text-primary'));

            applyFiltersAndSort();
        });
    }
}

document.addEventListener('DOMContentLoaded', initCatalog);

const productContext = {
    id: null,
    data: null,
    activeImage: null
};


function readStateFromURL() {
    const params = new URLSearchParams(window.location.search);
    activeFilters.category = params.get('category') || null;
    activeFilters.searchQuery = params.get('s') || '';
    activeFilters.priceMin = params.get('price_min') ? parseFloat(params.get('price_min')) : null;
    activeFilters.priceMax = params.get('price_max') ? parseFloat(params.get('price_max')) : null;
    currentSort = params.get('sort') || 'popular';
    currentPage = params.get('page') ? parseInt(params.get('page')) : 1;
    activeFilters.params = {};
    for (const [key, value] of params.entries()) {
        if (!['category', 'price_min', 'price_max', 'sort', 'page', 's'].includes(key)) {
            activeFilters.params[key] = value.split(',');
        }
    }
}

function writeStateToURL() {
    const params = new URLSearchParams(window.location.search);
    if (activeFilters.category) params.set('category', activeFilters.category);
    if (activeFilters.searchQuery) params.set('s', activeFilters.searchQuery);
    if (activeFilters.priceMin) params.set('price_min', activeFilters.priceMin);
    if (activeFilters.priceMax) params.set('price_max', activeFilters.priceMax);

    if (currentSort !== 'popular') params.set('sort', currentSort);
    if (currentPage > 1) {
        params.set('page', currentPage);
    } else {
        params.delete('page');       
    }


    for (const [key, valuesArray] of Object.entries(activeFilters.params)) {
        if (valuesArray && valuesArray.length > 0) {
            params.set(key, valuesArray.join(','));
        }
    }

    const queryString = params.toString();
    const newUrl = window.location.pathname + (queryString ? '?' + queryString : '');

    window.history.pushState({ path: newUrl }, '', newUrl);
}


function renderProductUI() {
    const product = productContext.data;

    document.title = `${product.name} | FitLife`;
    document.getElementById('prod-title').textContent = product.name;
    document.getElementById('prod-vendor').textContent = product.vendor || 'Без бренду';
    document.getElementById('prod-id').textContent = product.id;
    document.getElementById('prod-price').textContent = `${product.price.toLocaleString('uk-UA')} ₴`;


    const availabilityBadge = document.getElementById('prod-availability');
    if (product.available) {
        availabilityBadge.textContent = 'В наявності';
        availabilityBadge.className = 'bg-green-100 text-green-700 text-sm font-semibold px-3 py-1 rounded-full';
    } else {
        availabilityBadge.textContent = 'Очікується';
        availabilityBadge.className = 'bg-gray-100 text-gray-600 text-sm font-semibold px-3 py-1 rounded-full';
    }


    document.getElementById('prod-desc').innerHTML = product.description || '<p>Опис відсутній.</p>';


    const specsContainer = document.getElementById('prod-specs');
    let specsHTML = '';
    let isEven = false;

    for (const [key, value] of Object.entries(product.params || {})) {
        const bgClass = isEven ? 'bg-white' : 'bg-gray-50';
        specsHTML += `
            <div class="flex justify-between py-3 px-4 ${bgClass}">
                <span class="text-sm text-gray-500">${key}</span>
                <span class="text-sm font-medium text-gray-900 text-right">${value}</span>
            </div>
        `;
        isEven = !isEven;
    }
    specsContainer.innerHTML = specsHTML || '<div class="p-4 text-sm text-gray-500">Характеристики не вказані</div>';


    const mainImg = document.getElementById('prod-main-img');
    const thumbnailsContainer = document.getElementById('prod-thumbnails');

    if (product.pictures && product.pictures.length > 0) {
        mainImg.src = productContext.activeImage;

        let thumbHTML = '';
        product.pictures.forEach((picUrl) => {

            const isActive = picUrl === productContext.activeImage;
            const borderClass = isActive ? 'border-primary' : 'border-gray-200 hover:border-gray-400';


            thumbHTML += `
                <button data-image="${picUrl}" class="thumbnail-btn w-20 h-20 border-2 ${borderClass} rounded-lg p-1 flex-shrink-0 cursor-pointer transition">
                    <img src="${picUrl}" class="w-full h-full object-contain pointer-events-none">
                </button>
            `;
        });
        thumbnailsContainer.innerHTML = thumbHTML;
    } else {
        mainImg.src = 'https://via.placeholder.com/400?text=Немає+фото';
    }
}


