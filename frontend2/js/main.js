import { api, formatPrice } from './api.js';
import { LocalCart } from './cart.js';

// State
let user = null;
let token = localStorage.getItem('token');
let products = [];
let categories = [];
let selectedCategory = null;
let localCart = new LocalCart();
let serverCart = { items: [], total: 0 };
let editingProductId = null;

// Filter state
let searchTerm = '';
let minPrice = '';
let maxPrice = '';

// Initialize
async function init() {
  await loadCategories();
  await loadProducts();
  
  if (token) {
    await hydrateSession();
  }
  
  renderCategoryFilter();
  renderProducts();
  updateCartUI();
  setupEventListeners();
}

async function hydrateSession() {
  try {
    user = await api.me(token);
    updateUserUI();
    if (user.is_admin) {
      showAdminPanel();
    }
    await fetchServerCart();
  } catch (err) {
    console.error('Session error:', err);
    token = null;
    localStorage.removeItem('token');
  }
}

async function loadCategories() {
  try {
    categories = await api.getCategories();
    renderCategoryFilter();
    renderAdminCategorySelect();
  } catch (err) {
    showMessage('Kategoriyalarni olishda xatolik');
  }
}

async function loadProducts() {
  try {
    products = await api.getProducts(selectedCategory);
    renderProducts();
  } catch (err) {
    showMessage('Mahsulotlarni olishda xatolik');
  }
}

async function fetchServerCart() {
  try {
    const data = await api.getCart(token);
    serverCart = data;
    updateCartUI();
  } catch (err) {
    console.error('Cart error:', err);
  }
}

function updateUserUI() {
  const guestText = document.getElementById('guestText');
  const userPill = document.getElementById('userPill');
  const adminBadge = document.getElementById('adminBadge');
  const logoutBtn = document.getElementById('logoutBtn');

  if (user) {
    guestText.classList.add('d-none');
    logoutBtn.classList.remove('d-none');
    
    if (user.is_admin) {
      // Agar admin bo'lsa, faqat admin badge ko'rsatsin
      userPill.classList.add('d-none');
      adminBadge.classList.remove('d-none');
      adminBadge.textContent = user.username + ' (Admin)';
    } else {
      // Agar oddiy user bo'lsa, username ko'rsatsin
      userPill.classList.remove('d-none');
      userPill.textContent = user.username;
      adminBadge.classList.add('d-none');
    }
  } else {
    guestText.classList.remove('d-none');
    userPill.classList.add('d-none');
    adminBadge.classList.add('d-none');
    logoutBtn.classList.add('d-none');
  }
}

function renderCategoryFilter() {
  const container = document.getElementById('categoryFilter');
  const chips = [
    `<button class="chip ${selectedCategory === null ? 'active' : ''}" onclick="selectCategory(null)">Barchasi</button>`
  ];
  
  categories.forEach(cat => {
    chips.push(
      `<button class="chip ${selectedCategory === cat.id ? 'active' : ''}" onclick="selectCategory(${cat.id})">${cat.name}</button>`
    );
  });
  
  container.innerHTML = chips.join('');
}

function getFilteredProducts() {
  const term = searchTerm.toLowerCase();
  const min = minPrice ? Number(minPrice) : 0;
  const max = maxPrice ? Number(maxPrice) : Infinity;

  return products.filter(p => {
    const nameMatch = !term || p.name.toLowerCase().includes(term);
    const minMatch = p.price >= min;
    const maxMatch = p.price <= max;
    return nameMatch && minMatch && maxMatch;
  });
}

function renderProducts() {
  const grid = document.getElementById('productsGrid');
  const filtered = getFilteredProducts();
  
  if (filtered.length === 0) {
    grid.innerHTML = '<p class="subtle">Mahsulot topilmadi</p>';
    return;
  }

  grid.innerHTML = filtered.map(product => {
    const category = categories.find(c => c.id === product.category_id);
    const isAdmin = user?.is_admin;
    
    let html = `<div class="card">`;
    
    if (product.image_url) {
      html += `
        <div class="card-media">
          <img src="${product.image_url}" 
               alt="${product.name}"
               onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">
        </div>
      `;
    } else {
      html += `<div class="card-placeholder">IMG</div>`;
    }
    
    html += `
      <div class="card-body">
        <div class="card-meta">
          <span class="pill">${category?.name || 'No category'}</span>
          <span class="pill pill-ghost">Stock: ${product.stock}</span>
        </div>
        <h3 class="card-title">${product.name}</h3>
        <p class="card-desc">${product.description}</p>
        <div class="card-footer">
          <span class="price">${formatPrice(product.price)}</span>
          <div class="card-actions">
            <button class="btn-custom" onclick="addToCart(${product.id})">
              Savatga qo'shish
            </button>
    `;
    
    if (isAdmin) {
      html += `
            <button class="btn-custom ghost" onclick="editProduct(${product.id})">
              Tahrirlash
            </button>
      `;
    }
    
    html += `
          </div>
        </div>
      </div>
    </div>
    `;
    
    return html;
  }).join('');
}

function updateCartUI() {
  const cart = user ? serverCart : { items: localCart.getItems(), total: localCart.getTotal() };
  
  const cartCount = document.getElementById('cartCount');
  const cartItems = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');
  const copyBtn = document.getElementById('copyBtn');
  const clearBtn = document.getElementById('clearBtn');
  
  cartCount.textContent = `${cart.items.length} ta mahsulot`;
  cartTotal.textContent = formatPrice(cart.total);
  
  const hasItems = cart.items.length > 0;
  copyBtn.disabled = !hasItems;
  clearBtn.disabled = !hasItems;
  
  if (!hasItems) {
    cartItems.innerHTML = '<p class="subtle">Savat bo\'sh</p>';
    return;
  }
  
  cartItems.innerHTML = cart.items.map(item => `
    <div class="cart-item">
      <div>
        <p class="cart-title">${item.product.name}</p>
        <p class="subtle">${formatPrice(item.product.price)} × ${item.quantity}</p>
      </div>
      <div class="cart-actions">
        <input type="number" 
               min="1" 
               value="${item.quantity}"
               onchange="updateCartQuantity(${item.id}, this.value)">
        <button class="icon-btn" onclick="removeFromCart(${item.id})">✕</button>
      </div>
    </div>
  `).join('');
}

window.selectCategory = async function(categoryId) {
  selectedCategory = categoryId;
  await loadProducts();
  renderCategoryFilter();
};

window.addToCart = async function(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  
  if (user) {
    try {
      await api.addToCart(token, productId, 1);
      await fetchServerCart();
    } catch (err) {
      showMessage('Savatga qo\'shishda xatolik');
    }
  } else {
    localCart.add(product, 1);
    updateCartUI();
  }
};

window.updateCartQuantity = async function(itemId, quantity) {
  const qty = Number(quantity);
  
  if (user) {
    try {
      await api.updateCartItem(token, itemId, qty);
      await fetchServerCart();
    } catch (err) {
      showMessage('Miqdorni yangilashda xatolik');
    }
  } else {
    localCart.updateQuantity(itemId, qty);
    updateCartUI();
  }
};

window.removeFromCart = async function(itemId) {
  if (user) {
    try {
      await api.deleteCartItem(token, itemId);
      await fetchServerCart();
    } catch (err) {
      showMessage('Savatdan o\'chirishda xatolik');
    }
  } else {
    localCart.remove(itemId);
    updateCartUI();
  }
};

async function clearCart() {
  if (user) {
    try {
      await api.clearCart(token);
      await fetchServerCart();
    } catch (err) {
      showMessage('Savatni tozalashda xatolik');
    }
  } else {
    localCart.clear();
    updateCartUI();
  }
}

async function copyCart() {
  const cart = user ? serverCart : { items: localCart.getItems(), total: localCart.getTotal() };
  
  if (cart.items.length === 0) return;
  
  const lines = cart.items.map(item => {
    const total = item.product.price * item.quantity;
    return `${item.product.name} - ${item.quantity} dona - ${formatPrice(total)}`;
  });
  const text = lines.join('\n');
  
  // Try modern clipboard API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      showMessage('Savat nusxalandi ✓');
      return;
    } catch (err) {
      console.error('Clipboard API failed:', err);
    }
  }
  
  // Fallback
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, 99999);
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    
    if (success) {
      showMessage('Savat nusxalandi ✓');
    } else {
      showMessage('Nusxalashda xatolik');
    }
  } catch (err) {
    showMessage('Nusxalashda xatolik');
  }
}

// Admin functions
function openAdminModal() {
  if (user?.is_admin) {
    showAdminPanel();
  } else {
    document.getElementById('adminModalBackdrop').classList.remove('d-none');
  }
}

window.closeAdminModal = function() {
  document.getElementById('adminModalBackdrop').classList.add('d-none');
};

async function handleAdminLogin(e) {
  e.preventDefault();
  
  const username = document.getElementById('adminUsername').value;
  const password = document.getElementById('adminPassword').value;
  
  try {
    const data = await api.login(username, password);
    token = data.access_token;
    localStorage.setItem('token', token);
    
    user = await api.me(token);
    
    if (!user.is_admin) {
      showMessage('Bu foydalanuvchi admin emas');
      token = null;
      localStorage.removeItem('token');
      return;
    }
    
    updateUserUI();
    closeAdminModal();
    showAdminPanel();
    await fetchServerCart();
  } catch (err) {
    showMessage('Admin login xatolik');
  }
}

function showAdminPanel() {
  document.getElementById('adminPanel').classList.remove('d-none');
  renderAdminCategories();
  renderAdminProducts();
}

function handleLogout() {
  user = null;
  token = null;
  localStorage.removeItem('token');
  serverCart = { items: [], total: 0 };
  document.getElementById('adminPanel').classList.add('d-none');
  updateUserUI();
  updateCartUI();
}

function renderAdminCategorySelect() {
  const select = document.getElementById('productCategory');
  if (!select) return;
  
  select.innerHTML = '<option value="" disabled selected>Tanlang</option>';
  categories.forEach(cat => {
    select.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
  });
}

function renderAdminCategories() {
  const list = document.getElementById('categoriesList');
  if (!list) return;
  
  list.innerHTML = categories.map(cat => `
    <div class="row">
      <span>${cat.name}</span>
      <button class="icon-btn" onclick="deleteCategory(${cat.id})">✕</button>
    </div>
  `).join('');
}

async function handleCategorySubmit(e) {
  e.preventDefault();
  
  const name = document.getElementById('categoryName').value;
  const description = document.getElementById('categoryDescription').value;
  
  try {
    await api.createCategory(token, { name, description });
    await loadCategories();
    e.target.reset();
    showMessage('Kategoriya qo\'shildi');
  } catch (err) {
    showMessage('Kategoriya yaratishda xatolik');
  }
}

window.deleteCategory = async function(id) {
  if (!confirm('O\'chirmoqchimisiz?')) return;
  
  try {
    await api.deleteCategory(token, id);
    await loadCategories();
    await loadProducts();
    showMessage('Kategoriya o\'chirildi');
  } catch (err) {
    showMessage('Kategoriyani o\'chirishda xatolik');
  }
};

function renderAdminProducts() {
  const list = document.getElementById('productsList');
  if (!list) return;
  
  list.innerHTML = products.map(product => `
    <div class="row">
      <div>
        <p class="cart-title">${product.name}</p>
        <p class="subtle">${formatPrice(product.price)}</p>
      </div>
      <div class="row-actions">
        <button class="icon-btn" onclick="editProduct(${product.id})">✎</button>
        <button class="icon-btn" onclick="deleteProduct(${product.id})">✕</button>
      </div>
    </div>
  `).join('');
}

window.editProduct = function(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;
  
  editingProductId = id;
  document.getElementById('productFormTitle').textContent = 'Mahsulotni tahrirlash';
  document.getElementById('editingProductId').value = id;
  document.getElementById('productName').value = product.name;
  document.getElementById('productDescription').value = product.description;
  document.getElementById('productPrice').value = product.price;
  document.getElementById('productImageUrl').value = product.image_url || '';
  document.getElementById('productCategory').value = product.category_id;
  document.getElementById('productStock').value = product.stock;
  document.getElementById('productSubmitBtn').textContent = 'Yangilash';
  document.getElementById('cancelEditBtn').classList.remove('d-none');
};

function cancelProductEdit() {
  editingProductId = null;
  document.getElementById('productFormTitle').textContent = "Mahsulot qo'shish";
  document.getElementById('productForm').reset();
  document.getElementById('editingProductId').value = '';
  document.getElementById('productSubmitBtn').textContent = "Qo'shish";
  document.getElementById('cancelEditBtn').classList.add('d-none');
}

async function handleProductSubmit(e) {
  e.preventDefault();
  
  const productData = {
    name: document.getElementById('productName').value,
    description: document.getElementById('productDescription').value,
    price: Number(document.getElementById('productPrice').value),
    image_url: document.getElementById('productImageUrl').value || null,
    category_id: Number(document.getElementById('productCategory').value),
    stock: Number(document.getElementById('productStock').value)
  };
  
  try {
    if (editingProductId) {
      await api.updateProduct(token, editingProductId, productData);
      showMessage('Mahsulot yangilandi');
    } else {
      await api.createProduct(token, productData);
      showMessage('Mahsulot qo\'shildi');
    }
    
    await loadProducts();
    renderAdminProducts();
    cancelProductEdit();
  } catch (err) {
    showMessage('Mahsulotni saqlashda xatolik');
  }
}

window.deleteProduct = async function(id) {
  if (!confirm('O\'chirmoqchimisiz?')) return;
  
  try {
    await api.deleteProduct(token, id);
    await loadProducts();
    renderAdminProducts();
    showMessage('Mahsulot o\'chirildi');
  } catch (err) {
    showMessage('Mahsulotni o\'chirishda xatolik');
  }
};

function showMessage(text) {
  const alert = document.getElementById('messageAlert');
  const messageText = document.getElementById('messageText');
  
  messageText.textContent = text;
  alert.classList.remove('d-none');
  alert.classList.add('show');
  
  setTimeout(() => {
    alert.classList.remove('show');
    setTimeout(() => alert.classList.add('d-none'), 150);
  }, 3000);
}

window.hideMessage = function() {
  const alert = document.getElementById('messageAlert');
  alert.classList.remove('show');
  setTimeout(() => alert.classList.add('d-none'), 150);
};

function setupEventListeners() {
  // Burger Menu
  const menuToggle = document.getElementById('menuToggle');
  const topbar = document.querySelector('.topbar');
  
  menuToggle.addEventListener('click', () => {
    topbar.classList.toggle('menu-open');
  });
  
  // Close menu on button click
  document.querySelectorAll('.topbar-actions button').forEach(btn => {
    btn.addEventListener('click', () => {
      topbar.classList.remove('menu-open');
    });
  });

  // Search and filters
  document.getElementById('searchInput').addEventListener('input', (e) => {
    searchTerm = e.target.value;
    renderProducts();
  });
  
  document.getElementById('minPrice').addEventListener('input', (e) => {
    minPrice = e.target.value;
    renderProducts();
  });
  
  document.getElementById('maxPrice').addEventListener('input', (e) => {
    maxPrice = e.target.value;
    renderProducts();
  });
  
  // Cart actions
  document.getElementById('copyBtn').addEventListener('click', copyCart);
  document.getElementById('clearBtn').addEventListener('click', clearCart);
  
  // Admin
  document.getElementById('adminBtn').addEventListener('click', openAdminModal);
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);
  document.getElementById('adminLoginForm').addEventListener('submit', handleAdminLogin);
  document.getElementById('categoryForm').addEventListener('submit', handleCategorySubmit);
  document.getElementById('productForm').addEventListener('submit', handleProductSubmit);
  document.getElementById('cancelEditBtn').addEventListener('click', cancelProductEdit);
  
  // Close modal on backdrop click
  document.getElementById('adminModalBackdrop').addEventListener('click', (e) => {
    if (e.target.id === 'adminModalBackdrop') {
      closeAdminModal();
    }
  });
}

// Initialize app
init();
