//КОНСТАНТИ
const basketBtn = document.getElementById("btn-basket");
const closeBtn = document.getElementById("closeBtn");
const overlay = document.getElementById("overlay");
const cartItemsContainer = document.getElementById("cartItems");
const burger = document.querySelector('.burger');
const menu = document.querySelector('.menu');

let cart = [];

function formatPrice(price) {
    return Number(price).toLocaleString('uk-UA') + ' ₴';
}

function updateCartCount() {
    let countEl = document.querySelector("#btn-basket .cart-count");
    if (!countEl) {
        basketBtn.innerHTML = basketBtn.innerHTML + ' <span class="cart-count">0</span>';
        countEl = document.querySelector("#btn-basket .cart-count");
    }
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    countEl.textContent = totalItems;
}

function renderCart() {
    cartItemsContainer.innerHTML = `<h2>Ваш кошик</h2>`;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML += `<p style="text-align:center; color:#888; padding:50px 0;">Кошик порожній</p>`;
        return;
    }

    cart.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p class="cart-item-price">${formatPrice(item.price)}</p>
            </div>
            <div class="cart-item-quantity">
                <button class="qty-btn minus" data-index="${index}">-</button>
                <span>${item.quantity}</span>
                <button class="qty-btn plus" data-index="${index}">+</button>
            </div>
            <button class="remove-btn" data-index="${index}">🗑</button>
        `;
        cartItemsContainer.appendChild(div);
    });

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalDiv = document.createElement('div');
    totalDiv.className = 'cart-total';
    totalDiv.innerHTML = `<strong>Разом: ${formatPrice(total)}</strong>`;
    cartItemsContainer.appendChild(totalDiv);

    const checkoutBtn = document.createElement('button');
    checkoutBtn.id = 'checkout-btn';
    checkoutBtn.className = 'checkout-btn';
    checkoutBtn.textContent = 'Оформити замовлення';
    cartItemsContainer.appendChild(checkoutBtn);
}

function addToCart(product) {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    updateCartCount();
    showNotification(`✅ ${product.name} додано до кошика`);
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
    }, 2000);
}

function showSuccessModal() {
    const modal = document.createElement('div');
    modal.className = 'success-modal';
    modal.innerHTML = `
        <div class="success-content">
            <div class="success-icon">🎉</div>
            <h2>Замовлення оформлено!</h2>
            <p>Дякуємо за покупку в Tecno.<br>Ми зв'яжемося з вами найближчим часом.</p>
            <button class="success-close">Закрити</button>
        </div>
    `;
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);

    modal.querySelector('.success-close').addEventListener('click', () => {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
    });
}

function startVoice() {
    const input = document.getElementById("searchInput");
    if (!input) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        alert("Ваш браузер не підтримує голосовий пошук 😢\nСпробуйте Google Chrome");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "uk-UA";
    recognition.interimResults = false;

    recognition.onstart = () => {
        input.placeholder = "Слухаю... 🎤";
    };

    recognition.onresult = (event) => {
        input.value = event.results[0][0].transcript;
        input.placeholder = "Пошук...";
    };

    recognition.onerror = (event) => {
        input.placeholder = "Пошук...";
        if (event.error === "no-speech") {
            alert("Голос не розпізнано. Спробуйте ще раз.");
        } else if (event.error === "not-allowed") {
            alert("Доступ до мікрофона заборонено. Дозвольте в налаштуваннях браузера.");
        } else {
            alert("Помилка голосового пошуку: " + event.error);
        }
    };

    recognition.onend = () => {
        input.placeholder = "Пошук...";
    };

    recognition.start();
}

function toggleMenu() {
    document.querySelector('header').classList.toggle("menu-open");
}


function closeCart() {
    cartItemsContainer.style.opacity = "0";
    cartItemsContainer.style.transform = "translateY(20px)";
    setTimeout(() => {
        overlay.classList.remove("active");
    }, 250);
}

basketBtn.addEventListener("click", () => {
    renderCart();
    overlay.classList.add("active");
    setTimeout(() => {
        cartItemsContainer.style.opacity = "1";
        cartItemsContainer.style.transform = "translateY(0)";
    }, 10);
});

closeBtn.addEventListener("click", closeCart);
overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeCart();
});


cartItemsContainer.addEventListener("click", (e) => {
    const index = parseInt(e.target.dataset.index);

    if (e.target.classList.contains("plus")) {
        cart[index].quantity++;
    } else if (e.target.classList.contains("minus")) {
        if (cart[index].quantity > 1) cart[index].quantity--;
        else cart.splice(index, 1);
    } else if (e.target.classList.contains("remove-btn")) {
        cart.splice(index, 1);
    }

    if (e.target.id === "checkout-btn" && cart.length > 0) {
        closeCart();
        setTimeout(() => {
            showSuccessModal();
            cart = [];
            updateCartCount();
        }, 300);
    }

    renderCart();
    updateCartCount();
});


document.querySelectorAll('.buy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const card = btn.closest('.product-card');
        const product = {
            id: card.querySelector('h3').textContent.trim(),
            name: card.querySelector('h3').textContent.trim(),
            price: parseFloat(card.querySelector('.price').textContent.replace(/[^0-9]/g, '')),
            image: card.querySelector('img').src
        };
        addToCart(product);
    });
});


burger.addEventListener('click', toggleMenu);
updateCartCount();