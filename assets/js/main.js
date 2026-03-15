document.addEventListener('DOMContentLoaded', function () {
    let lastScrollTop = 0;
    const header = document.getElementById('main-header');
    window.addEventListener('scroll', function() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > lastScrollTop && scrollTop > 64) {
            header.classList.add('-translate-y-full');
        } else {   
            header.classList.remove('-translate-y-full');
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    });

    const cartOpenBtn = document.getElementById('cart-open-btn');
    const cartCloseBtn = document.getElementById('cart-close-btn');
    const cartContinueBtn = document.getElementById('cart-continue-btn');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartDrawer = document.getElementById('cart-drawer');
   
    function openCart() {
        cartOverlay.classList.remove('hidden');
       
        setTimeout(() => {
            cartOverlay.classList.remove('opacity-0');
            cartDrawer.classList.remove('translate-x-full');
        }, 10);
       
        document.body.classList.add('overflow-hidden');
    }
   
    function closeCart() {
        cartOverlay.classList.add('opacity-0');
        cartDrawer.classList.add('translate-x-full');
       
        setTimeout(() => {
            cartOverlay.classList.add('hidden');
        }, 300);
        document.body.classList.remove('overflow-hidden');
    }

    cartOpenBtn.addEventListener('click', openCart);
    cartCloseBtn.addEventListener('click', closeCart);
    cartContinueBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    const searchForm = document.getElementById('search-form');
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    const searchClose = document.getElementById('search-close');

    let isSearchOpen = false;

    function openSearch() {        
        searchForm.classList.remove('w-10', 'bg-transparent');
        searchForm.classList.add('w-64', 'bg-gray-100', 'border', 'border-gray-200');
        searchInput.classList.remove('opacity-0', 'pointer-events-none');
        searchInput.classList.add('opacity-100');        
        searchClose.classList.remove('hidden');
        searchClose.classList.add('flex');
        setTimeout(() => searchInput.focus(), 300);
        isSearchOpen = true;
    }
    
    function closeSearch() {   
        searchForm.classList.remove('w-64', 'bg-gray-100', 'border', 'border-gray-200');
        searchForm.classList.add('w-10', 'bg-transparent');
        searchInput.classList.remove('opacity-100');
        searchInput.classList.add('opacity-0', 'pointer-events-none');
        searchInput.value = '';
        searchClose.classList.remove('flex');
        searchClose.classList.add('hidden');
        isSearchOpen = false;
    }
    
    searchBtn.addEventListener('click', function(e) {
        if (!isSearchOpen) {
            e.preventDefault(); 
            openSearch();
        } else {
            if (searchInput.value.trim() === '') {
                e.preventDefault(); 
                searchInput.focus(); 
            }
        }
    });

    searchClose.addEventListener('click', closeSearch);
    document.addEventListener('click', function(event) {
        if (isSearchOpen && !searchForm.contains(event.target)) {
            closeSearch();
        }
    });

    document.querySelector('.current-year').textContent = new Date().getFullYear();
})