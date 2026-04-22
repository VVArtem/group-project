// Оголошуємо змінні глобально (якщо вони ще не оголошені в іншому підключеному файлі)
let allProducts = [];
let filteredProducts = []; 
let currentPage = 1;
const itemsPerPage = 12;

async function initFrontPage() {
    try {
        const response = await fetch('assets/bd/catalog.json');
        
        // Перевіряємо, чи успішно завантажився файл
        if (!response.ok) throw new Error("Не вдалося завантажити JSON");
        
        const data = await response.json();
        allProducts = data.products;
        
        let result = [...allProducts];
        
        // Фільтруємо (рекомендую includes, якщо це масив)
        result = result.filter(p => p.params && p.params.Категорії && p.params.Категорії.includes("Уцінка"));
        
        // ВАЖЛИВО: Записуємо результат у ГЛОБАЛЬНУ змінну
        filteredProducts = result;
        
        // ВАЖЛИВО: Викликаємо функцію БЕЗ аргументів
        renderProductsGrid(filteredProducts);
        
     } catch (error) { 
         // Тепер ви побачите, якщо щось зламається!
         console.error("Помилка на головній сторінці:", error); 
     }
}

document.addEventListener('DOMContentLoaded', initFrontPage);