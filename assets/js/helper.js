function renderProductsGrid(filteredProducts, itemsPerPage = 4, currentPage = 1) {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const productsToShow = filteredProducts.slice(startIndex, endIndex);

    if (productsToShow.length === 0) {
        grid.innerHTML = '<div class="col-span-full py-10 text-center text-gray-500">За вашими критеріями нічого не знайдено. Спробуйте змінити фільтри.</div>';
        return;
    }

    productsToShow.forEach(product => {
        const imgUrl = product.pictures && product.pictures.length > 0 ? product.pictures[0] : 'https://via.placeholder.com/300?text=Немає+фото';
        const badgeHTML = product.available
            ? `<span class="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">В наявності</span>`
            : `<span class="absolute top-2 left-2 bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">Очікується</span>`;

        const cardHTML = `
            <div class="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col group">
                <div class="h-56 p-4 flex items-center justify-center relative bg-white">
                    <img src="${imgUrl}" alt="${product.name}" class="max-h-full object-contain transition-transform duration-500 group-hover:scale-105">
                    ${badgeHTML}
                </div>
                <div class="p-5 flex-1 flex flex-col border-t border-gray-50">
                    <p class="text-xs text-gray-500 mb-1 uppercase tracking-wider font-medium">${product.vendor || 'Інший бренд'}</p>
                    <h3 class="text-md font-bold text-gray-800 mb-2 hover:text-primary cursor-pointer leading-tight flex-1">
                        <a href="single?id=${product.id}">${product.name}</a>
                    </h3>
                    <div class="flex items-center justify-between mt-auto pt-4">
                        <span class="text-2xl font-black text-gray-900 tracking-tight">${product.price} <span class="text-lg font-bold text-gray-500">₴</span></span>
                        <button onclick="addToCart('${product.id}')" class="bg-primary hover:bg-primaryHover text-white px-4 py-2.5 rounded-lg transition-colors shadow-sm flex items-center text-sm font-bold">
                            <svg class="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                            Купити
                        </button>
                    </div>
                </div>
            </div>
        `;
        if (typeof writeStateToURL === 'function') {
            writeStateToURL();
        }
        grid.insertAdjacentHTML('beforeend', cardHTML);
    });
}