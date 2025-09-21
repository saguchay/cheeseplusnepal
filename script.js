// Load data from JSON file
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        window.productsData = data.products;
        window.reviewsData = data.reviews;
        initializeApp();
    })
    .catch(error => console.error('Error loading JSON:', error));

// Encryption for cookies
const secretKey = 'cheeseplusnepal2025'; // Simple key for XOR encryption
function encrypt(data) {
    let result = '';
    for (let i = 0; i < data.length; i++) {
        result += String.fromCharCode(data.charCodeAt(i) ^ secretKey.charCodeAt(i % secretKey.length));
    }
    return btoa(result); // Base64 encode for safe storage
}

function decrypt(data) {
    try {
        const decoded = atob(data);
        let result = '';
        for (let i = 0; i < decoded.length; i++) {
            result += String.fromCharCode(decoded.charCodeAt(i) ^ secretKey.charCodeAt(i % secretKey.length));
        }
        return result;
    } catch (e) {
        return null;
    }
}

// Cookie handling
function setCookie(name, value, days) {
    const encryptedValue = encrypt(value);
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${encryptedValue};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name) {
    const nameEQ = name + "=";
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.indexOf(nameEQ) === 0) {
            const encryptedValue = cookie.substring(nameEQ.length);
            return decrypt(encryptedValue);
        }
    }
    return null;
}

function acceptCookies() {
    setCookie('cookieConsent', 'accepted', 365);
    document.getElementById('cookie-consent').style.display = 'none';
    // Store last viewed product
    setCookie('lastProductId', currentProductId.toString(), 30);
}

let currentProductId = 1;
let currentImageIndex = 0;
let productCarouselIndex = 0;
let reviewCarouselIndex = 0;

function displayMainProduct(productId) {
    const product = window.productsData.find(p => p.id === productId);
    if (!product) return;

    currentProductId = productId;
    currentImageIndex = 0;

    document.getElementById('main-title').textContent = product.title;
    document.getElementById('main-description').textContent = product.description;
    document.getElementById('main-category').textContent = `Category: ${product.category}`;
    document.getElementById('main-image').src = product.images[currentImageIndex];
    document.getElementById('main-image').alt = product.title;

    // Display features
    const featuresList = document.getElementById('features-list');
    featuresList.innerHTML = '';
    product.features.forEach(feature => {
        const li = document.createElement('li');
        li.textContent = feature;
        featuresList.appendChild(li);
    });

    setCookie('lastProductId', productId.toString(), 30);
}

function slideImage(direction) {
    const product = window.productsData.find(p => p.id === currentProductId);
    if (!product) return;

    if (direction === 'next') {
        currentImageIndex = (currentImageIndex + 1) % product.images.length;
    } else {
        currentImageIndex = (currentImageIndex - 1 + product.images.length) % product.images.length;
    }

    const image = document.getElementById('main-image');
    image.style.transform = `translateX(${direction === 'next' ? '-100%' : '100%'})`;
    setTimeout(() => {
        image.src = product.images[currentImageIndex];
        image.style.transform = 'translateX(0)';
    }, 300);
}

function displayProducts() {
    const productsContainer = document.getElementById('products-container');
    productsContainer.innerHTML = '';

    window.productsData.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');
        productCard.innerHTML = `
            <img src="${product.images[0]}" alt="${product.title}" class="card-image">
            <h2 class="card-title">${product.title}</h2>
            <p class="card-description">${product.shortDescription}</p>
            <button class="view-more-btn" onclick="displayMainProduct(${product.id})">View More</button>
        `;
        productsContainer.appendChild(productCard);
    });

    updateProductCarouselButtons();
}

function slideProductCarousel(direction) {
    const container = document.getElementById('products-container');
    const cardWidth = 270; // 250px card + 20px gap
    const totalCards = window.productsData.length;
    const containerWidth = document.getElementById('products').offsetWidth;
    const visibleCards = Math.floor(containerWidth / cardWidth);
    const maxIndex = Math.max(0, totalCards - visibleCards);

    if (direction === 'next' && productCarouselIndex < maxIndex) {
        productCarouselIndex++;
    } else if (direction === 'prev' && productCarouselIndex > 0) {
        productCarouselIndex--;
    }

    // Ensure the transform doesn't exceed the container's bounds
    const maxTranslate = -(maxIndex * cardWidth);
    const translateX = Math.max(maxTranslate, -productCarouselIndex * cardWidth);
    container.style.transform = `translateX(${translateX}px)`;

    updateProductCarouselButtons();
}

function updateProductCarouselButtons() {
    const prevButton = document.getElementById('product-carousel-prev');
    const nextButton = document.getElementById('product-carousel-next');
    const containerWidth = document.getElementById('products').offsetWidth;
    const cardWidth = 270;
    const totalCards = window.productsData.length;
    const visibleCards = Math.floor(containerWidth / cardWidth);
    const maxIndex = Math.max(0, totalCards - visibleCards);

    prevButton.disabled = productCarouselIndex === 0;
    nextButton.disabled = productCarouselIndex >= maxIndex;
}

function displayReviews() {
    const reviewsContainer = document.getElementById('reviews-container');
    reviewsContainer.innerHTML = '';

    window.reviewsData.forEach(review => {
        const reviewCard = document.createElement('div');
        reviewCard.classList.add('review-card');
        reviewCard.innerHTML = `
            <img src="${review.image}" alt="${review.name}" class="review-image">
            <div class="review-content">
                <h3>${review.name}</h3>
                <p>"${review.text}"</p>
            </div>
        `;
        reviewsContainer.appendChild(reviewCard);
    });

    updateReviewCarouselButtons();
}

function slideReviewCarousel(direction) {
    const container = document.getElementById('reviews-container');
    const cardWidth = 320; // 300px card + 20px gap
    const totalCards = window.reviewsData.length;
    const containerWidth = document.getElementById('reviews').offsetWidth;
    const visibleCards = Math.floor(containerWidth / cardWidth);
    const maxIndex = Math.max(0, totalCards - visibleCards);

    if (direction === 'next' && reviewCarouselIndex < maxIndex) {
        reviewCarouselIndex++;
    } else if (direction === 'prev' && reviewCarouselIndex > 0) {
        reviewCarouselIndex--;
    }

    // Ensure the transform doesn't exceed the container's bounds
    const maxTranslate = -(maxIndex * cardWidth);
    const translateX = Math.max(maxTranslate, -reviewCarouselIndex * cardWidth);
    container.style.transform = `translateX(${translateX}px)`;

    updateReviewCarouselButtons();
}

function updateReviewCarouselButtons() {
    const prevButton = document.getElementById('review-carousel-prev');
    const nextButton = document.getElementById('review-carousel-next');
    const containerWidth = document.getElementById('reviews').offsetWidth;
    const cardWidth = 320;
    const totalCards = window.reviewsData.length;
    const visibleCards = Math.floor(containerWidth / cardWidth);
    const maxIndex = Math.max(0, totalCards - visibleCards);

    prevButton.disabled = reviewCarouselIndex === 0;
    nextButton.disabled = reviewCarouselIndex >= maxIndex;
}

function showPopup() {
    document.getElementById('health-benefits-popup').style.display = 'block';
}

function hidePopup() {
    document.getElementById('health-benefits-popup').style.display = 'none';
}

// Touch swipe support for products
let productTouchStartX = 0;
let productTouchEndX = 0;

document.getElementById('products-container').addEventListener('touchstart', e => {
    productTouchStartX = e.changedTouches[0].screenX;
});

document.getElementById('products-container').addEventListener('touchend', e => {
    productTouchEndX = e.changedTouches[0].screenX;
    if (productTouchStartX - productTouchEndX > 50) {
        slideProductCarousel('next');
    } else if (productTouchEndX - productTouchStartX > 50) {
        slideProductCarousel('prev');
    }
});

// Touch swipe support for reviews
let reviewTouchStartX = 0;
let reviewTouchEndX = 0;

document.getElementById('reviews-container').addEventListener('touchstart', e => {
    reviewTouchStartX = e.changedTouches[0].screenX;
});

document.getElementById('reviews-container').addEventListener('touchend', e => {
    reviewTouchEndX = e.changedTouches[0].screenX;
    if (reviewTouchStartX - reviewTouchEndX > 50) {
        slideReviewCarousel('next');
    } else if (reviewTouchEndX - reviewTouchStartX > 50) {
        slideReviewCarousel('prev');
    }
});

function initializeApp() {
    // Check cookie consent
    if (!getCookie('cookieConsent')) {
        document.getElementById('cookie-consent').style.display = 'block';
    }

    // Load last viewed product
    const lastProductId = getCookie('lastProductId');
    displayMainProduct(lastProductId ? parseInt(lastProductId) : 1);

    displayProducts();
    displayReviews();

    // Update button states on window resize
    window.addEventListener('resize', () => {
        updateProductCarouselButtons();
        updateReviewCarouselButtons();
    });
}