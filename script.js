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
function renderProducts(products) {
    productList.innerHTML = "";

    if (products.length === 0) {
        productList.innerHTML = `<p style="grid-column:1/-1;text-align:center;padding:60px;color:#888;">
            Товарів у цій категорії поки немає 😔
        </p>`;
        return;
    }

    

    function showDescription() {
        modalDescription.classList.remove('hidden');
    }
    products.forEach(product => {
        const desc = product.description || 'Опис товару скоро з’явиться';
        const shortDesc = desc.substring(0, 110) + (desc.length > 110 ? '...' : '');

        const cardHTML = `
            <div class="product-card" onclick="showDescription()">
                <img src="${product.image}" alt="${product.title}">

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

    // Кнопки "Купити"
    document.querySelectorAll('.buy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
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

function showAllProducts() {
    filterBtns.forEach(btn => btn.classList.remove('active'));
    document.querySelector('.filter-btn[data-category="all"]').classList.add('active');
    renderProducts(allProducts);
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



updateUserUI();

loadProducts();
updateCartCount();

