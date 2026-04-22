

async function initSingleProductPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');


    if (!productId) return;

    try {
        const response = await fetch('assets/bd/catalog.json');
        const data = await response.json();

        const product = data.products.find(p => p.id === productId);

        if (!product) {
            document.getElementById('prod-title').textContent = "Товар не знайдено";
            return;
        }

        document.title = `${product.name} | FitLife`;
        document.getElementById('prod-title').textContent = product.name;
        document.getElementById('prod-vendor').textContent = product.vendor || 'Без бренду';
        document.getElementById('prod-id').textContent = product.id;
        document.getElementById('prod-price').textContent = `${product.price.toLocaleString('uk-UA')} ₴`;

        document.getElementById('breadcrumb-name').textContent = product.name;

        const category = data.categories.find(c => c.id === product.categoryId);
        const breadcrumbCat = document.getElementById('breadcrumb-category');
        const slashCat = document.getElementById('slash-category');

        if (category) {
            breadcrumbCat.textContent = category.name;
            breadcrumbCat.href = `home?category=${category.id}`;

        } else {
            breadcrumbCat.style.display = 'none';
            slashCat.style.display = 'none';
        }


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
            mainImg.src = product.pictures[0];
            let thumbHTML = '';
            product.pictures.forEach((picUrl, index) => {
                const borderClass = index === 0 ? 'border-primary' : 'border-gray-200 hover:border-gray-400';
                thumbHTML += `
                    <button onclick="changeMainImage('${picUrl}', this)" class="thumbnail-btn w-20 h-20 border-2 ${borderClass} rounded-lg p-1 flex-shrink-0 cursor-pointer transition">
                        <img src="${picUrl}" class="w-full h-full object-contain">
                    </button>
                `;
            });
            thumbnailsContainer.innerHTML = thumbHTML;
        } else {
            mainImg.src = 'https://via.placeholder.com/400?text=Немає+фото';
        }

        const buyBtn = document.getElementById('prod-buy-btn');
        if (buyBtn) {
            buyBtn.addEventListener('click', () => {

                const qtyInput = document.getElementById('quantity');
                const qty = qtyInput ? qtyInput.value : 1;

                addToCart(product.id, qty);
            });
        }
    } catch (error) {
        console.error('Помилка завантаження товару:', error);
    }
}

function changeMainImage(newSrc, clickedButton) {
    const mainImg = document.getElementById('prod-main-img');
    mainImg.style.opacity = '0.5';
    setTimeout(() => {
        mainImg.src = newSrc;
        mainImg.style.opacity = '1';
    }, 150);
    document.querySelectorAll('.thumbnail-btn').forEach(btn => {
        btn.classList.remove('border-primary');
        btn.classList.add('border-gray-200', 'hover:border-gray-400');
    });
    clickedButton.classList.remove('border-gray-200', 'hover:border-gray-400');
    clickedButton.classList.add('border-primary');
}

document.addEventListener('DOMContentLoaded', initSingleProductPage);


