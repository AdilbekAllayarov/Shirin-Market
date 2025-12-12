export class LocalCart {
  constructor() {
    this.items = this.load();
  }

  load() {
    const saved = localStorage.getItem('localCart');
    return saved ? JSON.parse(saved) : [];
  }

  save() {
    localStorage.setItem('localCart', JSON.stringify(this.items));
  }

  add(product, quantity = 1) {
    const existing = this.items.find(item => item.id === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.items.push({
        id: product.id,
        product: product,
        quantity: quantity
      });
    }
    this.save();
  }

  updateQuantity(itemId, quantity) {
    if (quantity <= 0) {
      this.remove(itemId);
      return;
    }
    const item = this.items.find(i => i.id === itemId);
    if (item) {
      item.quantity = quantity;
      this.save();
    }
  }

  remove(itemId) {
    this.items = this.items.filter(i => i.id !== itemId);
    this.save();
  }

  clear() {
    this.items = [];
    this.save();
  }

  getTotal() {
    return this.items.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);
  }

  getItems() {
    return this.items;
  }
}
