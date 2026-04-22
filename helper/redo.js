const fs = require('fs');
const { DOMParser } = require('@xmldom/xmldom');

function convertYmlToJsonWithFilters(xmlFile, jsonFile) {
    console.log(`Читаємо файл ${xmlFile}...`);
    try {
        const xmlData = fs.readFileSync(xmlFile, 'utf-8');
        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlData, 'text/xml');
        const shop = doc.getElementsByTagName('shop')[0];
        
        
        const categories = [];
        const categoryNodes = shop.getElementsByTagName('categories')[0].getElementsByTagName('category');

        for (let i = 0; i < categoryNodes.length; i++) {
            const cat = categoryNodes[i];
            const categoryData = {
                id: cat.getAttribute('id'),
                name: cat.textContent
            };
            const parentId = cat.getAttribute('parentId');
            if (parentId) {
                categoryData.parentId = parentId;
            }
            categories.push(categoryData);
        }

        
        const filtersRaw = {
            "Бренд": new Set()
        };

        
        const products = [];
        const offerNodes = shop.getElementsByTagName('offers')[0].getElementsByTagName('offer');
        
        const getText = (offerNode, tagName) => {
            const node = offerNode.getElementsByTagName(tagName)[0];
            return node ? node.textContent : null;
        };

        for (let i = 0; i < offerNodes.length; i++) {
            const offer = offerNodes[i];
            const vendor = getText(offer, 'vendor');

            
            if (vendor) {
                filtersRaw["Бренд"].add(vendor);
            }

            const productData = {
                id: offer.getAttribute('id'),
                available: offer.getAttribute('available') === 'true',
                url: getText(offer, 'url'),
                price: parseFloat(getText(offer, 'price') || 0),
                categoryId: getText(offer, 'categoryId'),
                vendor: vendor,
                name: getText(offer, 'name'),
                pictures: [],
                description: getText(offer, 'description'),
                params: {}
            };

            const pictureNodes = offer.getElementsByTagName('picture');
            for (let j = 0; j < pictureNodes.length; j++) {
                productData.pictures.push(pictureNodes[j].textContent);
            }

            
            const paramNodes = offer.getElementsByTagName('param');
            for (let j = 0; j < paramNodes.length; j++) {
                const param = paramNodes[j];
                const paramName = param.getAttribute('name');
                const paramValue = param.textContent;

                productData.params[paramName] = paramValue;

                
                if (!filtersRaw[paramName]) {
                    filtersRaw[paramName] = new Set();
                }
                
                filtersRaw[paramName].add(paramValue);
            }
            
            products.push(productData);
        }
        
        
        const filtersReady = {};
        for (const [key, valueSet] of Object.entries(filtersRaw)) {
            
            filtersReady[key] = Array.from(valueSet).sort();
        }

        
        const result = {
            filters: filtersReady, 
            categories: categories,
            products: products
        };
        
        console.log(`Оброблено товарів: ${products.length}. Зберігаємо у ${jsonFile}...`);
        fs.writeFileSync(jsonFile, JSON.stringify(result, null, 2), 'utf-8');
        console.log("Готово! Ваш JSON створено.");

    } catch (error) {
        console.error("Помилка під час обробки:", error.message);
    }
}


convertYmlToJsonWithFilters('assets/bd/019e038c33d39d4f2d5f519b3e852c06.xml', 'assets/bd/catalog.json');