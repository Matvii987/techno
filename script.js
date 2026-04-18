// ====================== КОШИК ======================
let cart = [];

const basketBtn = document.getElementById("btn-basket");
const overlay = document.getElementById("overlay");
const modal = document.getElementById("modal");
const closeBtn = document.getElementById("closeBtn");
const cartItemsContainer = document.getElementById("cartItems");
const productList = document.getElementById("productList");

// Завантаження товарів
async function loadProducts() {
    try {
        const response = await fetch("products.json");
        const products = await response.json();

        productList.innerHTML = "";

        products.forEach(product => {
            const cardHTML = `
                <div class="product-card">
                    <div class="badge">Кращ</div>
                    <img src="${product.image || 'assets/samsung_s25.jpg'}" alt="${product.title}">
                    <h3>${product.title}</h3>
                    <div class="price">
                        ${product.price.toLocaleString('uk-UA')} ₴
                    </div>
                    <button class="buy-btn" data-id="${product.id}">
                        <i class="ti ti-shopping-cart"></i>
                    </button>
                </div>
            `;
            productList.innerHTML += cardHTML;
        });

        // Додаємо обробники після створення карток
        document.querySelectorAll('.buy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                const product = products.find(p => p.id === id);
                if (product) addToCart(product);
            });
        });

    } catch (error) {
        console.error("Помилка завантаження товарів:", error);
        productList.innerHTML = "<p>Не вдалося завантажити товари.</p>";
    }
}

// Форматування ціни
function formatPrice(price) {
    return Number(price).toLocaleString('uk-UA') + ' ₴';
}

// Оновлення кількості в кошику
function updateCartCount() {
    let countEl = document.querySelector("#btn-basket .cart-count");
    if (!countEl) {
        basketBtn.innerHTML = `<i class="ti ti-shopping-cart"></i> Кошик <span class="cart-count">0</span>`;
        countEl = document.querySelector("#btn-basket .cart-count");
    }
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    countEl.textContent = totalItems;
}

// Рендер кошика
function renderCart() {
    cartItemsContainer.innerHTML = `<h2 style="margin-bottom:15px;">Ваш кошик</h2>`;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML += `<p style="text-align:center; color:#888; padding:60px 0;">Кошик порожній 😔</p>`;
        return;
    }

    cart.forEach((item, index) => {
        const itemHTML = `
            <div class="cart-item">
                <img src="${item.image || 'assets/samsung_s25.jpg'}" alt="${item.title}" class="cart-item-img">
                <div class="cart-item-info">
                    <h4>${item.title}</h4>
                    <p class="cart-item-price">${formatPrice(item.price)}</p>
                </div>
                <div class="cart-item-quantity">
                    <button class="qty-btn minus" data-index="${index}">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn plus" data-index="${index}">+</button>
                </div>
                <button class="remove-btn" data-index="${index}">🗑</button>
            </div>
        `;
        cartItemsContainer.innerHTML += itemHTML;
    });

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    cartItemsContainer.innerHTML += `
        <div class="cart-total">
            <strong>Разом: ${formatPrice(total)}</strong>
        </div>
        <button id="checkout-btn" class="checkout-btn">Оформити замовлення</button>
    `;
}

// Додавання в кошик
function addToCart(product) {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    updateCartCount();
    showNotification(`✅ ${product.title} додано до кошика`);
}

// Повідомлення
function showNotification(msg) {
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.textContent = msg;
    document.body.appendChild(notif);

    setTimeout(() => notif.classList.add('show'), 10);
    setTimeout(() => {
        notif.classList.remove('show');
        setTimeout(() => notif.remove(), 300);
    }, 2200);
}

// Модальне вікно успіху
function showSuccessModal() {
    const modalHTML = `
        <div class="success-modal" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);display:flex;justify-content:center;align-items:center;z-index:3000;">
            <div style="background:white;padding:40px 30px;border-radius:16px;text-align:center;max-width:340px;box-shadow:0 10px 30px rgba(0,0,0,0.3);">
                <div style="font-size:70px;margin-bottom:15px;">🎉</div>
                <h2 style="color:#5cbd1c;margin-bottom:10px;">Замовлення оформлено!</h2>
                <p style="color:#555;margin-bottom:25px;">Дякуємо за покупку в Tecno.<br>Ми зв'яжемося з вами найближчим часом.</p>
                <button onclick="this.closest('.success-modal').remove()" style="padding:14px 30px;background:#5cbd1c;color:white;border:none;border-radius:10px;cursor:pointer;">Закрити</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Голосовий пошук
function startVoice() {
    const input = document.getElementById("searchInput");
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert("Ваш браузер не підтримує голосовий пошук. Спробуйте Chrome.");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "uk-UA";
    recognition.interimResults = false;

    recognition.onstart = () => input.placeholder = "Слухаю... 🎤";
    recognition.onresult = (e) => input.value = e.results[0][0].transcript;
    recognition.onerror = () => input.placeholder = "Пошук...";
    recognition.onend = () => input.placeholder = "Пошук...";

    recognition.start();
}

// Відкриття/закриття меню на мобільних
function toggleMenu() {
    document.querySelector('header').classList.toggle("menu-open");
}

// Закриття кошика
function closeCart() {
    overlay.classList.remove("active");
}

// ====================== ІНІЦІАЛІЗАЦІЯ ======================
basketBtn.addEventListener("click", () => {
    renderCart();
    overlay.classList.add("active");
});

closeBtn.addEventListener("click", closeCart);
overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeCart();
});

// Обробка кліків у кошику (зміна кількості, видалення, оформлення)
cartItemsContainer.addEventListener("click", (e) => {
    const index = parseInt(e.target.dataset.index);

    if (e.target.classList.contains("plus")) {
        cart[index].quantity++;
    } else if (e.target.classList.contains("minus")) {
        if (cart[index].quantity > 1) cart[index].quantity--;
        else cart.splice(index, 1);
    } else if (e.target.classList.contains("remove-btn")) {
        cart.splice(index, 1);
    } else if (e.target.id === "checkout-btn" && cart.length > 0) {
        closeCart();
        setTimeout(() => {
            showSuccessModal();
            cart = [];
            updateCartCount();
        }, 400);
        return;
    }

    renderCart();
    updateCartCount();
});

// Завантаження товарів при старті
loadProducts();
updateCartCount();