


function getCart() {
    const cart = localStorage.getItem('fitlife_cart');
    return cart ? JSON.parse(cart) : []; 
}


function saveCart(cart) {
    localStorage.setItem('fitlife_cart', JSON.stringify(cart));
    updateCartCounter(); 
}



function addToCart(productId, quantity = 1) {
    
    quantity = parseInt(quantity);
    if (isNaN(quantity) || quantity < 1) quantity = 1;
    const cart = getCart();

    
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        
        existingItem.quantity += quantity;
    } else {
        
        cart.push({ id: productId, quantity: quantity });
    }

    
    saveCart(cart);

    
    if (typeof openCart === 'function') {
        openCart();
    } else {
    }
}


function updateCartCounter() {
    const cart = getCart();
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const counterElement = document.getElementById('cart-counter');
    if (counterElement) {
        counterElement.textContent = totalItems;
        
        counterElement.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}


document.addEventListener('DOMContentLoaded', updateCartCounter);



async function renderCartUI() {
    const container = document.getElementById('cart-items-container');
    const totalElement = document.getElementById('cart-total-price');
    if (!container || !totalElement) return;
    const cart = getCart();     
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-gray-500">
                <svg class="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                <p>Ваш кошик порожній</p>
            </div>
        `;
        totalElement.textContent = '0';
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
            html += `
                <div class="flex items-center bg-white">
                    <img src="${imgUrl}" alt="${product.name}" class="w-16 h-16 object-contain border border-gray-200 rounded-md p-1">
                    <div class="ml-4 flex-1">
                        <h3 class="text-sm font-medium text-gray-900 line-clamp-2"><a href="single?id=${product.id}" class="hover:text-primary">${product.name}</a></h3>
                        <div class="flex items-center mt-2 border border-gray-300 rounded w-fit">
                            <button onclick="updateCartItemQty('${cartItem.id}', -1)" class="px-2 text-gray-500 hover:text-primary transition focus:outline-none">-</button>
                            <span class="text-sm px-2 font-medium">${cartItem.quantity}</span>
                            <button onclick="updateCartItemQty('${cartItem.id}', 1)" class="px-2 text-gray-500 hover:text-primary transition focus:outline-none">+</button>
                        </div>
                    </div>
                    <div class="ml-4 flex flex-col items-end">
                        <span class="text-sm font-bold text-gray-900">${itemTotal.toLocaleString('uk-UA')} ₴</span>
                        <button onclick="removeFromCart('${cartItem.id}')" class="text-xs text-red-500 hover:text-red-700 underline mt-2 transition focus:outline-none">Видалити</button>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
        totalElement.textContent = totalPrice.toLocaleString('uk-UA');
    } catch (error) {
        console.error('Помилка завантаження кошика:', error);
        container.innerHTML = '<p class="text-center text-red-500 mt-10">Помилка завантаження даних</p>';
    }
}




function updateCartItemQty(productId, change) {
    let cart = getCart();
    const item = cart.find(i => i.id === productId);
    
    if (item) {
        item.quantity += change;
        
        
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id !== productId);
        }
        
        saveCart(cart); 
        renderCartUI(); 
    }
}


function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(i => i.id !== productId);
    saveCart(cart);
    renderCartUI(); 
}