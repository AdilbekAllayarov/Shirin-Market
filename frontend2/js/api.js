const API_URL = 'http://192.168.1.4:8000';

export const api = {
  // Auth
  async login(username, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return response.json();
  },

  async me(token) {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Categories
  async getCategories() {
    const response = await fetch(`${API_URL}/categories`);
    return response.json();
  },

  async createCategory(token, data) {
    const response = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async deleteCategory(token, id) {
    const response = await fetch(`${API_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Products
  async getProducts(categoryId = null) {
    const url = categoryId 
      ? `${API_URL}/products?category_id=${categoryId}`
      : `${API_URL}/products`;
    const response = await fetch(url);
    return response.json();
  },

  async createProduct(token, data) {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async updateProduct(token, id, data) {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async deleteProduct(token, id) {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Cart (for authenticated users)
  async getCart(token) {
    const response = await fetch(`${API_URL}/cart`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  async addToCart(token, productId, quantity) {
    const response = await fetch(`${API_URL}/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ product_id: productId, quantity })
    });
    return response.json();
  },

  async updateCartItem(token, itemId, quantity) {
    const response = await fetch(`${API_URL}/cart/${itemId}?quantity=${quantity}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  async deleteCartItem(token, itemId) {
    const response = await fetch(`${API_URL}/cart/${itemId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  async clearCart(token) {
    const response = await fetch(`${API_URL}/cart`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
};

export function formatPrice(price) {
  return new Intl.NumberFormat('ru-RU').format(Number(price)) + ' sum';
}
