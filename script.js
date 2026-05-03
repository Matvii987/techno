let cart = [];
let allProducts = [];

// Елементи
const basketBtn = document.getElementById("btn-basket");
const overlay = document.getElementById("overlay");
const modal = document.getElementById("modal");
const closeBtn = document.getElementById("closeBtn");
const cartItemsContainer = document.getElementById("cartItems");
const productList = document.getElementById("productList");
const filterBtns = document.querySelectorAll('.filter-btn');
const header = document.querySelector('header');    
const burger = document.querySelector('.burger');   
const menu = document.querySelector('.menu');       
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('submit-btn');
const logBtn = document.getElementById('log-btn');
const authModal = document.getElementById("authModal");
const authTitle = document.getElementById("authTitle");
const authName = document.getElementById("authName");
const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");
const authSubmit = document.getElementById("authSubmit");
const toggleAuth = document.getElementById("toggleAuth");
const closeAuth = document.getElementById("closeAuth");
const authConfirm = document.getElementById("authConfirm");
const katalog = document.getElementById('katalog');
const modalDescription = document.getElementById('modal-description');
const card = document.querySelector('.product-card');
const stars = document.querySelectorAll('.star');
const result = document.getElementById('result');

// ========================= БУРГЕР МЕНЮ =========================
function toggleMenu() {
    header.classList.toggle('menu-open');
}

// Закриття меню при кліку на кнопку всередині меню
document.querySelectorAll('.menu button').forEach(btn => {
    btn.addEventListener('click', () => {
        header.classList.remove('menu-open');
    });
});

// ========================= ЗАВАНТАЖЕННЯ ТОВАРІВ =========================
async function loadProducts() {
    try {
        const response = await fetch("products.json");
        allProducts = await response.json();
        renderProducts(allProducts);
    } catch (error) {
        console.error("Помилка завантаження товарів:", error);
        productList.innerHTML = `<p style="grid-column:1/-1;text-align:center;padding:50px;color:#888;">
            Не вдалося завантажити товари.
        </p>`;
    }
}

// Рендер товарів
// Рендер товарів
function renderProducts(products) {
    productList.innerHTML = "";

    if (products.length === 0) {
        productList.innerHTML = `<p style="grid-column:1/-1;text-align:center;padding:60px;color:#888;">
            Товарів у цій категорії поки немає 😔
        </p>`;
        return;
    }

    products.forEach(product => {
        const desc = product.description || 'Опис товару скоро з’явиться...';
        const shortDesc = desc.substring(0, 110) + (desc.length > 110 ? '...' : '');

        const cardHTML = `
            <div class="product-card" data-id="${product.id}">
                <img src="${product.image}" alt="${product.title}">
                <h3>${product.title}</h3>
                <div class="price">
                    ${product.price.toLocaleString('uk-UA')} ₴
                </div>
                <button class="buy-btn" data-id="${product.id}">
                    <i class="ti ti-shopping-cart"></i>
                </button>
                <div class="stars">
                  <span class="star" data-value="1">★</span>
                  <span class="star" data-value="2">★</span>
                  <span class="star" data-value="3">★</span>
                  <span class="star" data-value="4">★</span>
                  <span class="star" data-value="5">★</span>
                </div>
            </div>
        `;
        productList.innerHTML += cardHTML;
    });

    // Обробка кліку по всій картці (крім кнопки Купити)
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // Якщо клікнули по кнопці "Купити" — не відкриваємо опис
            if (e.target.closest('.buy-btn')) {
                return;
            }

            const id = parseInt(card.dataset.id);
            const product = allProducts.find(p => p.id === id);
            if (product) {
                showProductDescription(product);
            }
        });
    });

    // Кнопки "Купити"
    document.querySelectorAll('.buy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Важливо! щоб не спрацьовував клік по картці
            const id = parseInt(btn.dataset.id);
            const product = allProducts.find(p => p.id === id);
            if (product) addToCart(product);
        });
    });
}

// Фільтрація
function filterProducts(category) {
    filterBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });

    if (category === "all") {
        renderProducts(allProducts);
    } else {
        const filtered = allProducts.filter(p => p.category === category);
        renderProducts(filtered);
    }
}

// ========================= КОШИК =========================
function updateCartCount() {
    let countEl = document.querySelector("#btn-basket .cart-count");
    if (!countEl) {
        basketBtn.innerHTML = `<i class="ti ti-shopping-cart"></i> Кошик <span class="cart-count">0</span>`;
        countEl = document.querySelector("#btn-basket .cart-count");
    }
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    countEl.textContent = totalItems;
}

function renderCart() {
    cartItemsContainer.innerHTML = `<h2>Ваш кошик</h2>`;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML += `<p style="text-align:center; color:#888; padding:80px 20px;">
            Кошик порожній 😔<br>Додайте щось зі списку товарів
        </p>`;
        return;
    }

    cart.forEach((item, index) => {
        const itemHTML = `
            <div class="cart-item">
                <img src="${item.image || 'assets/placeholder.jpg'}" alt="${item.title}" class="cart-item-img">
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

function addToCart(product) {
    const user = JSON.parse(localStorage.getItem("currentUser"));

    if (!user) {
        showNotification("⚠️ Увійдіть, щоб додати товар");
        authModal.style.display = "flex";
        return;
    }

    const existing = cart.find(item => item.id === product.id);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    updateCartCount();
    showNotification(`✅ ${product.title} додано до кошика`);
}

function formatPrice(price) {
    return Number(price).toLocaleString('uk-UA') + ' ₴';
}

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

// Голосовий пошук
function startVoice() {
    const input = document.getElementById("searchInput");
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Ваш браузер не підтримує голосовий пошук.");
        return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "uk-UA";
    recognition.onresult = (e) => input.value = e.results[0][0].transcript;
    recognition.start();
}

// Закриття кошика
function closeCart() {
    overlay.classList.remove("active");
}

// ========================= ІНІЦІАЛІЗАЦІЯ =========================
basketBtn.addEventListener("click", () => {
    renderCart();
    overlay.classList.add("active");
});

closeBtn.addEventListener("click", closeCart);
overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeCart();
});

// Обробка кліків у кошику
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

// Фільтри
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const category = btn.dataset.category;
        filterProducts(category);
    });
});

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

// ========================= ПОШУК =========================

// Основна функція пошуку
function searchProducts(value) {
    const query = value.toLowerCase().trim();

    if (query === "") {
        renderProducts(allProducts);
        return;
    }

    const filtered = allProducts.filter(product => {
        const title = product.title.toLowerCase();
        const description = (product.description || "").toLowerCase();

        return title.includes(query) || description.includes(query);
    });

    renderProducts(filtered);
}

// Пошук при вводі (живий)
searchInput.addEventListener("input", function () {
    searchProducts(this.value);
});

// Пошук по кнопці
searchBtn.addEventListener("click", function () {
    searchProducts(searchInput.value);
});

// Пошук по Enter
searchInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        searchProducts(this.value);
    }
});

// =================== login ==============
let isLogin = true;

// Відкрити
if (logBtn) {
    logBtn.addEventListener("click", () => {
        authModal.style.display = "flex";
    });
}

// Закрити
if (closeAuth) {
    closeAuth.addEventListener("click", () => {
        authModal.style.display = "none";
    });
}

// ================= ПЕРЕМИКАННЯ =================
if (toggleAuth) {
    toggleAuth.addEventListener("click", () => {
        isLogin = !isLogin;

        if (isLogin) {
            authTitle.textContent = "Вхід";
            authSubmit.textContent = "Увійти";
            authName.style.display = "none";
            authConfirm.style.display = "none";
            toggleAuth.innerHTML = `Немає акаунту? <span>Зареєструватися</span>`;
        } else {
            authTitle.textContent = "Реєстрація";
            authSubmit.textContent = "Зареєструватися";
            authName.style.display = "block";
            authConfirm.style.display = "block";
            toggleAuth.innerHTML = `Вже є акаунт? <span>Увійти</span>`;
        }
    });
}

// ================= ОСНОВНА ЛОГІКА =================
if (authSubmit) {
    authSubmit.addEventListener("click", () => {
        const email = authEmail.value.trim();
        const password = authPassword.value.trim();
        const confirm = authConfirm.value.trim();
        const name = authName.value.trim();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // Валідація
        if (!email || !password || (!isLogin && (!name || !confirm))) {
            alert("Заповни всі поля");
            return;
        }

        if (!emailRegex.test(email)) {
            alert("Некоректний email");
            return;
        }

        if (password.length < 8) {
            alert("Пароль має бути мінімум 8 символів");
            return;
        }

        if (!isLogin && password !== confirm) {
            alert("Паролі не співпадають");
            return;
        }

        const users = JSON.parse(localStorage.getItem("users")) || [];

        // ===== ВХІД =====
        if (isLogin) {
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                localStorage.setItem("currentUser", JSON.stringify(user));
                showNotification(`👋 Привіт, ${user.name}`);
                authModal.style.display = "none";
                updateUserUI();
            } else {
                alert("Невірний email або пароль");
            }

        } else {
            // ===== РЕЄСТРАЦІЯ =====
            const exists = users.find(u => u.email === email);

            if (exists) {
                alert("Користувач вже існує");
                return;
            }

            const newUser = { name, email, password };
            users.push(newUser);
            localStorage.setItem("users", JSON.stringify(users));

            showNotification("✅ Реєстрація успішна!");

            isLogin = true;
            toggleAuth.click();
        }
    });
}

// ================= UI КОРИСТУВАЧА =================
function updateUserUI() {
    const user = JSON.parse(localStorage.getItem("currentUser"));

    if (logBtn) {
        if (user) {
            logBtn.textContent = "Вийти";
            logBtn.onclick = () => {
                localStorage.removeItem("currentUser");
                showNotification("👋 Ви вийшли з акаунту");
                updateUserUI();
            };
        } else {
            logBtn.textContent = "Увійти";
            logBtn.onclick = () => {
                authModal.style.display = "flex";
            };
        }
    }
}

document.querySelectorAll(".toggle-pass").forEach(btn => {
    btn.addEventListener("click", () => {
        const input = document.getElementById(btn.dataset.target);

        if (input.type === "password") {
            input.type = "text";
            btn.textContent = "🙈";
        } else {
            input.type = "password";
            btn.textContent = "👁";
        }
    });
});

// Показати опис товару
function showProductDescription(product) {
    const modal = document.getElementById('modal-description');
    const content = document.getElementById('description-content');

    content.innerHTML = `
        <img src="${product.image}" alt="${product.title}">
        <h2>${product.title}</h2>
        <div class="price">${product.price.toLocaleString('uk-UA')} ₴</div>
        <p>${product.description || 'Опис товару скоро з’явиться...'}</p>
        
        <button class="buy-btn" style="width:100%; height:52px; border-radius:12px; font-size:18px; margin-top:20px;" data-id="${product.id}">
            <i class="ti ti-shopping-cart"></i> Додати до кошика
        </button>
    `;

    modal.classList.add('active');

    // Кнопка "Додати до кошика" всередині модального вікна
    content.querySelector('.buy-btn').addEventListener('click', () => {
        addToCart(product);
    });
}

// Закриття модального вікна опису
function closeDescriptionModal() {
    const modal = document.getElementById('modal-description');
    modal.classList.remove('active');
}

// Ініціалізація закриття модального вікна опису
document.getElementById('closeBtn-d').addEventListener('click', closeDescriptionModal);

// Закриття при кліку по фону
document.getElementById('modal-description').addEventListener('click', (e) => {
    if (e.target.id === 'modal-description') {
        closeDescriptionModal();
    }
});



// ====================== СИСТЕМА ОЦІНЮВАННЯ ======================

// Отримати всі оцінки товару
function getProductRatings(productId) {
    const ratings = JSON.parse(localStorage.getItem('productRatings')) || {};
    return ratings[productId] || [];
}

// Додати/оновити оцінку
function addRating(productId, rating) {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user) {
        showNotification("⚠️ Увійдіть, щоб поставити оцінку");
        authModal.style.display = "flex";
        return;
    }

    let ratings = JSON.parse(localStorage.getItem('productRatings')) || {};
    
    if (!ratings[productId]) ratings[productId] = [];
    
    // Видаляємо стару оцінку цього користувача (якщо є)
    ratings[productId] = ratings[productId].filter(r => r.userEmail !== user.email);
    
    // Додаємо нову
    ratings[productId].push({
        userEmail: user.email,
        rating: rating,
        date: new Date().toISOString()
    });

    localStorage.setItem('productRatings', JSON.stringify(ratings));
    
    showNotification(`✅ Дякуємо! Ви поставили ${rating} ★`);
    renderProducts(allProducts); // оновлюємо всі картки
}

// Обчислення середнього рейтингу
function getAverageRating(productId) {
    const ratings = getProductRatings(productId);
    if (ratings.length === 0) return 0;
    
    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    return (sum / ratings.length).toFixed(1);
}

// Рендер зірок (HTML)
function renderStarsHTML(productId, average = 0) {
    let html = '';
    const avg = parseFloat(average);
    
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(avg)) {
            html += `<span class="star active" data-value="${i}">★</span>`;
        } else if (i - 0.5 < avg && avg < i) {
            html += `<span class="star half" data-value="${i}">★</span>`;
        } else {
            html += `<span class="star" data-value="${i}">★</span>`;
        }
    }
    return html;
}

// Головна функція рендеру товарів (оновлена)
function renderProducts(products) {
    productList.innerHTML = "";

    if (products.length === 0) {
        productList.innerHTML = `<p style="grid-column:1/-1;text-align:center;padding:60px;color:#888;">
            Товарів у цій категорії поки немає 😔
        </p>`;
        return;
    }

    products.forEach(product => {
        const avgRating = getAverageRating(product.id);
        const ratingsCount = getProductRatings(product.id).length;

        const desc = product.description || 'Опис товару скоро з’явиться...';
        const shortDesc = desc.substring(0, 110) + (desc.length > 110 ? '...' : '');

        const cardHTML = `
            <div class="product-card" data-id="${product.id}">
                <img src="${product.image}" alt="${product.title}">
                <h3>${product.title}</h3>
                <div class="price">
                    ${product.price.toLocaleString('uk-UA')} ₴
                </div>
                
                <div class="stars" style="margin: 8px 0 12px;">
                    ${renderStarsHTML(product.id, avgRating)}
                    <span style="font-size:13px; color:#666; margin-left:6px;">
                        ${avgRating > 0 ? avgRating : '—'} 
                        ${ratingsCount ? `(${ratingsCount})` : ''}
                    </span>
                </div>

                <button class="buy-btn" data-id="${product.id}">
                    <i class="ti ti-shopping-cart"></i>
                </button>
            </div>
        `;
        productList.innerHTML += cardHTML;
    });

    // Клік по всій картці (відкрити опис)
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.buy-btn') || e.target.closest('.stars')) return;

            const id = parseInt(card.dataset.id);
            const product = allProducts.find(p => p.id === id);
            if (product) showProductDescription(product);
        });
    });

    // Кнопка "Купити"
    document.querySelectorAll('.buy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            const product = allProducts.find(p => p.id === id);
            if (product) addToCart(product);
        });
    });

    // Клік по зірках
    attachStarListeners();
}

// Прикріплення обробників на зірки
function attachStarListeners() {
    document.querySelectorAll('.product-card .stars').forEach(starsContainer => {
        const productId = parseInt(starsContainer.closest('.product-card').dataset.id);

        starsContainer.querySelectorAll('.star').forEach(star => {
            star.addEventListener('click', (e) => {
                e.stopPropagation();
                const rating = parseInt(star.dataset.value);
                addRating(productId, rating);
            });
        });
    });
}

// Оновлення функції showProductDescription (додаємо зірки в модальне вікно)
function showProductDescription(product) {
    const modal = document.getElementById('modal-description');
    const content = document.getElementById('description-content');
    const avgRating = getAverageRating(product.id);
    const count = getProductRatings(product.id).length;

    content.innerHTML = `
        <img src="${product.image}" alt="${product.title}">
        <h2>${product.title}</h2>

        <div class="price">${product.price.toLocaleString('uk-UA')} ₴</div>
        <p>${product.description || 'Опис товару скоро з’явиться...'}</p>
        
        <button class="buy-btn" style="width:100%; height:52px; border-radius:12px; font-size:18px; margin-top:20px;" data-id="${product.id}">
            <i class="ti ti-shopping-cart"></i> Додати до кошика
        </button>
    `;

    modal.classList.add('active');

    // Кнопка купити
    content.querySelector('.buy-btn').addEventListener('click', () => {
        addToCart(product);
    });

}

updateUserUI();
loadProducts();
updateCartCount();

