async function renderCheckoutCartUI() {
    const container = document.getElementById('checkout-cart-item-conteiner');
    const totalElement = document.getElementById('checkout-cart-total-price');
    const dueCart = document.getElementById('due-cart');
    if (!container || !totalElement || !dueCart) return;
    
    const cart = getCart();
    const hasDiscount = localStorage.getItem('fitlife_game_discount') === 'true';

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-gray-500">
                <svg class="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                <p>Ваш кошик порожній</p>
            </div>
        `;
        totalElement.textContent = '0';
        dueCart.textContent = '0';
        return;
    }
    
    container.innerHTML = '<p class="text-center text-gray-400 mt-10">Завантаження...</p>';
    try {
        let productsDb = typeof allProducts !== 'undefined' && allProducts.length > 0 ? allProducts : null;

        if (!productsDb) {
            const res = await fetch('assets/bd/catalog.json');
            const data = await res.json();
            productsDb = data.products;
        }
        let html = '';
        let totalPrice = 0;
        
        cart.forEach(cartItem => {
            const product = productsDb.find(p => p.id === cartItem.id);
            if (!product) return;
            const imgUrl = product.pictures && product.pictures.length > 0 ? product.pictures[0] : 'https://via.placeholder.com/150?text=No+Image';
            
            const itemTotal = product.price * cartItem.quantity;
            totalPrice += itemTotal;
            
            let priceHtml = `<div class="ml-4 text-sm font-bold text-gray-900">${itemTotal.toLocaleString('uk-UA')} ₴</div>`;
            
            if (hasDiscount) {
                const discountedItemTotal = Math.round(itemTotal * 0.33);
                priceHtml = `
                    <div class="ml-4 flex flex-col items-end">
                        <span class="text-xs text-gray-400 line-through">${itemTotal.toLocaleString('uk-UA')} ₴</span>
                        <span class="text-sm font-bold text-green-600">${discountedItemTotal.toLocaleString('uk-UA')} ₴</span>
                        <span class="text-[10px] bg-green-100 text-green-800 px-1 rounded font-bold mt-1">-67%</span>
                    </div>
                `;
            }

            html += `
                <div class="flex items-start mb-4">
                    <div class="w-16 h-16 flex-shrink-0 border border-gray-200 rounded-md overflow-hidden p-1">
                        <img src="${imgUrl}" alt="${product.name}" class="w-full h-full object-contain">
                    </div>
                    <div class="ml-4 flex-1">
                        <h3 class="text-sm font-medium text-gray-900 line-clamp-2"><a href="single?id=${product.id}" class="hover:text-primary">${product.name}</a></h3>
                        <p class="text-sm text-gray-500 mt-1">${cartItem.quantity} шт.</p>
                    </div>
                    ${priceHtml}
                </div>
            `;
        });
        container.innerHTML = html;
                
        if (hasDiscount) {
            const discountedTotal = Math.round(totalPrice * 0.33);
            totalElement.innerHTML = `
                <span class="text-sm text-gray-400 line-through font-normal mr-2">${totalPrice.toLocaleString('uk-UA')} ₴</span>
                <span class="text-green-600">${discountedTotal.toLocaleString('uk-UA')} ₴</span>
            `;
            dueCart.innerHTML = `<span class="text-green-600">${discountedTotal.toLocaleString('uk-UA')} ₴</span>`;
        } else {
            totalElement.textContent = totalPrice.toLocaleString('uk-UA') + " ₴";
            dueCart.textContent = totalPrice.toLocaleString('uk-UA') + " ₴";
        }
        
    } catch (error) {
        console.error('Помилка завантаження кошика:', error);
        container.innerHTML = '<p class="text-center text-red-500 mt-10">Помилка завантаження даних</p>';
    }
}


function completeOrder(event) {
    
    if (event) {
        event.preventDefault(); 
    }

    const cart = getCart();
    if (cart.length === 0) {
        alert("Ваш кошик порожній. Додайте товари перед оформленням!");
        return;
    }

    
    
    
    const hasDiscount = localStorage.getItem('fitlife_game_discount') === 'true';
    if (hasDiscount) {
        alert("Дякуємо за замовлення! Ваша крута знижка -67% була успішно застосована 🎉");
    } else {
        alert("Дякуємо за замовлення! Очікуйте на дзвінок менеджера.");
    }    
    localStorage.removeItem('fitlife_cart');    
    localStorage.removeItem('fitlife_game_discount');    
    if (typeof updateCartCounter === 'function') {
        updateCartCounter();
    }    
    window.location.href = 'index.html'; 
}


document.addEventListener('DOMContentLoaded', renderCheckoutCartUI);