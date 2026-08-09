const WHATSAPP_NUMBER = "7001937504";
const CURRENCY_SYMBOL = "₹";

let flowers = [];
let cart = {};

// Mobile Menu Function
function toggleMobileMenu(show) {
    const menu = document.getElementById('mobile-menu');
    if (show) menu.classList.remove('hidden');
    else menu.classList.add('hidden');
}

function handleCategoryChange() {
    const catSelect = document.getElementById('category-select');
    const subcatSelect = document.getElementById('subcategory-select');
    const selectedCat = catSelect.value;
    
    subcatSelect.innerHTML = '';
    
    if (selectedCat === 'All') {
        const opt = document.createElement('option');
        opt.value = 'All';
        opt.textContent = 'All Stages (Select category first)';
        subcatSelect.appendChild(opt);
    } else {
        const stages = ['All Stages', 'Mature', 'Blooming', 'Sapling'];
        stages.forEach(stage => {
            const opt = document.createElement('option');
            opt.value = stage === 'All Stages' ? 'All' : stage;
            opt.textContent = stage;
            subcatSelect.appendChild(opt);
        });
    }
    filterStore();
}

function initStore(filteredItems = flowers) {
    const grid = document.getElementById('flower-grid');
    const emptyState = document.getElementById('empty-state');
    if (!grid) return;
    
    grid.innerHTML = "";
    
    if (filteredItems.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    } else {
        emptyState.classList.add('hidden');
    }

    filteredItems.forEach(flower => {
        const card = document.createElement('div');
        card.className = "bg-white rounded-2xl overflow-hidden shadow-sm border border-neutral-200/80 hover:shadow-md transition-all flex flex-col group cursor-pointer";
        card.setAttribute('onclick', `openLightbox(${JSON.stringify(flower)})`);
        
        card.innerHTML = `
            <div class="aspect-[3/4] w-full bg-neutral-100 relative overflow-hidden">
               <img src="${flower.image}" alt="${flower.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
               <span class="absolute bottom-3 left-3 bg-black/70 text-white text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-md backdrop-blur-sm uppercase---"> ${flower.category} · ${flower.subcategory}
                </span>
             </div>
            <div class="p-5 flex-grow flex flex-col justify-between" onclick="event.stopPropagation()">
                <div>
                    <h3 class="serif-font text-lg font-bold text-neutral-900 mb-1 group-hover:text-emerald-800 transition-colors">${flower.name}</h3>
                    <p class="text-xs text-neutral-500 line-clamp-2 leading-relaxed mb-4">${flower.desc}</p>
                </div>
                <div class="flex items-center justify-between pt-2 border-t border-neutral-100">
                    <span class="text-base font-semibold text-neutral-900 font-mono">${CURRENCY_SYMBOL}${flower.price}</span>
                    <button onclick="addToCart(${flower.id})" class="bg-emerald-50 hover:bg-emerald-700 text-emerald-800 hover:text-white px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border border-emerald-200/60 flex items-center gap-1.5">
                        Add +
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function filterStore() {
    const searchVal = document.getElementById('search-input').value.toLowerCase();
    const selectedCat = document.getElementById('category-select').value;
    const selectedSubcat = document.getElementById('subcategory-select').value;

    const matches = flowers.filter(item => {
        const matchSearch = item.name.toLowerCase().includes(searchVal) || item.desc.toLowerCase().includes(searchVal);
        const matchCat = (selectedCat === 'All' || item.category === selectedCat);
        const matchSubcat = (selectedSubcat === 'All' || !selectedSubcat || item.subcategory === selectedSubcat);
        return matchSearch && matchCat && matchSubcat;
    });

    initStore(matches);
}

function addToCart(id) {
    cart[id] = (cart[id] || 0) + 1;
    saveCartState();
    updateCartUI();
    const flower = flowers.find(f => f.id === id);
    triggerToast(`Added ${flower.name} to your cart`);
}

function updateCartQuantity(id, amount) {
    if (cart[id]) {
        cart[id] += amount;
        if (cart[id] <= 0) delete cart[id];
        saveCartState();
        updateCartUI();
    }
}

function saveCartState() {
    localStorage.setItem('chankay_cart', JSON.stringify(cart));
}

function updateCartUI() {
    const container = document.getElementById('cart-items-container');
    const countLabel = document.getElementById('cart-count');
    const badgeLabel = document.getElementById('cart-badge-count');
    const totalLabel = document.getElementById('cart-total-price');
    
    if (!container) return;
    container.innerHTML = "";
    
    let itemCounter = 0;
    let totalCash = 0;

    Object.keys(cart).forEach(id => {
        const plant = flowers.find(f => f.id == id);
        if (plant) {
            const quantity = cart[id];
            itemCounter += quantity;
            totalCash += plant.price * quantity;

            const row = document.createElement('div');
            row.className = "flex items-center justify-between gap-4 p-3 bg-neutral-50 rounded-xl border border-neutral-200/60";
            row.innerHTML = `
                <div class="flex items-center gap-3">
                    <img src="${plant.image}" class="w-12 h-12 rounded-lg object-contain bg-neutral-100">
                    <div>
                        <h4 class="text-xs font-semibold text-neutral-900">${plant.name}</h4>
                        <span class="text-[10px] text-neutral-500 font-mono">${CURRENCY_SYMBOL}${plant.price} /pcs</span>
                    </div>
                </div>
                <div class="flex items-center gap-2.5">
                    <button onclick="updateCartQuantity(${plant.id}, -1)" class="w-6 h-6 rounded bg-white border border-neutral-300 flex items-center justify-center text-xs font-bold hover:bg-neutral-100">-</button>
                    <span class="text-xs font-semibold text-neutral-800 min-w-[12px] text-center">${quantity}</span>
                    <button onclick="updateCartQuantity(${plant.id}, 1)" class="w-6 h-6 rounded bg-white border border-neutral-300 flex items-center justify-center text-xs font-bold hover:bg-neutral-100">+</button>
                </div>
            `;
            container.appendChild(row);
        }
    });

    if (itemCounter === 0) {
        container.innerHTML = `
            <div class="text-center py-12 text-neutral-400">
                <p class="text-sm">Your basket is currently empty</p>
            </div>
        `;
    }

    countLabel.textContent = itemCounter;
    badgeLabel.textContent = itemCounter;
    totalLabel.textContent = `${CURRENCY_SYMBOL}${totalCash.toFixed(2)}`;
}

function toggleCartModal(show) {
    const modal = document.getElementById('cart-modal');
    if (show) modal.classList.remove('hidden');
    else modal.classList.add('hidden');
}

function openLightbox(plantOrEvent) {
    const modal = document.getElementById('lightbox');
    if (!plantOrEvent || plantOrEvent.target) return;
    
    document.getElementById('lightbox-img').src = plantOrEvent.image;
    document.getElementById('lightbox-title').textContent = plantOrEvent.name;
    document.getElementById('lightbox-desc').textContent = plantOrEvent.desc;
    document.getElementById('lightbox-price').textContent = `${CURRENCY_SYMBOL}${plantOrEvent.price}`;
    document.getElementById('lightbox-badge').textContent = `${plantOrEvent.category} · ${plantOrEvent.subcategory}`;
    
    modal.classList.remove('hidden');
}

function closeLightbox(e) {
    document.getElementById('lightbox').classList.add('hidden');
}

function toggleLightbox(show) {
    if (!show) document.getElementById('lightbox').classList.add('hidden');
}

function triggerToast(txt) {
    const tray = document.getElementById('toast-container');
    const alertBox = document.createElement('div');
    alertBox.className = "bg-neutral-900 text-white text-xs px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 transition-all opacity-0 translate-y-2";
    alertBox.innerHTML = `
        <svg class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
        <span>${txt}</span>
    `;
    tray.appendChild(alertBox);
    setTimeout(() => {
        alertBox.classList.remove('opacity-0', 'translate-y-2');
    }, 50);
    setTimeout(() => {
        alertBox.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => alertBox.remove(), 300);
    }, 3000);
}

function submitBookingToWhatsApp() {
    const name = document.getElementById('cust-name').value.trim();
    const phone = document.getElementById('cust-phone').value.trim();
    const city = document.getElementById('cust-city').value.trim();
    const po = document.getElementById('cust-po').value.trim();
    const dist = document.getElementById('cust-dist').value.trim();
    const state = document.getElementById('cust-state').value.trim();
    const pin = document.getElementById('cust-pin').value.trim();

    if (!name || !phone || !pin) {
        alert("Please fill out Name, Phone, and Pincode fields to proceed.");
        return;
    }

    if (Object.keys(cart).length === 0) {
        alert("Your cart is empty. Please add items before checking out.");
        return;
    }

    let textOut = `🌸 *NEW ORCHID ORDER - We are Orchid Fellow s* \n\n`;
    textOut += `*Customer Details:*\n👤 Name: ${name}\n📞 Phone: ${phone}\n\n`;
    textOut += `*Shipping Address:*\n📍 City: ${city}\n🏢 P.O.: ${po}\n🗺️ District: ${dist}\n🏛️ State: ${state}\n📮 Pincode: ${pin}\n\n`;
    textOut += `*Items Ordered:*\n`;

    let invoiceSum = 0;
    Object.keys(cart).forEach(id => {
        const plant = flowers.find(f => f.id == id);
        if (plant) {
            const quantity = cart[id];
            const rowCost = plant.price * quantity;
            invoiceSum += rowCost;
            textOut += `▪️ ${plant.name} [${plant.category} | ${plant.subcategory}] x${quantity} — ₹${rowCost}\n`;
        }
    });

    textOut += `\n💰 *Total Payable Amount: ₹${invoiceSum.toFixed(2)}*`;
    
    const encoded = encodeURIComponent(textOut);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank');
}

// Fetch the extracted data.json to initialize the store asynchronously
document.addEventListener("DOMContentLoaded", () => {
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            flowers = data;
            initStore();
            const localSaved = localStorage.getItem('chankay_cart');
            if (localSaved) {
                try {
                    cart = JSON.parse(localSaved);
                    updateCartUI();
                } catch(err) {
                    cart = {};
                }
            }
        })
        .catch(error => console.error("Error loading JSON data:", error));
});