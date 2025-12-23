import { useEffect, useMemo, useState } from 'react'
import './App.css'
import {
  authApi,
  categoryApi,
  productApi,
  cartApi,
} from './api/client'
import ProductCard from './components/ProductCard'
import CartPanel from './components/CartPanel'
import CategoryFilter from './components/CategoryFilter'

const initialProductForm = {
  name: '',
  description: '',
  price: 0,
  image_url: '',
  category_id: '',
  stock: 0,
}

const initialCategoryForm = { name: '', description: '' }

function App() {
  const [user, setUser] = useState(null)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [cart, setCart] = useState({ items: [], total: 0 }) // server cart (auth)
  const [localCart, setLocalCart] = useState({ items: [], total: 0 }) // guest cart
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [productForm, setProductForm] = useState(initialProductForm)
  const [categoryForm, setCategoryForm] = useState(initialCategoryForm)
  const [editingProductId, setEditingProductId] = useState(null)
  const [adminModalOpen, setAdminModalOpen] = useState(false)
  const [adminForm, setAdminForm] = useState({ username: 'admin', password: '' })
  const [showProductForm, setShowProductForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  useEffect(() => {
    fetchCategories()
    fetchProducts()
    const token = localStorage.getItem('token')
    if (token) {
      hydrateSession()
    }
  }, [])

  useEffect(() => {
    fetchProducts(selectedCategory)
  }, [selectedCategory])

  const labeledProducts = useMemo(
    () =>
      products.map((p) => ({
        ...p,
        category: categories.find((c) => c.id === p.category_id),
      })),
    [products, categories]
  )

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    const min = minPrice !== '' ? Number(minPrice) : null
    const max = maxPrice !== '' ? Number(maxPrice) : null

    return labeledProducts.filter((p) => {
      const nameOk = term ? p.name.toLowerCase().includes(term) : true
      const minOk = min !== null ? p.price >= min : true
      const maxOk = max !== null ? p.price <= max : true
      return nameOk && minOk && maxOk
    })
  }, [labeledProducts, searchTerm, minPrice, maxPrice])

  const formatPrice = (value) => `${new Intl.NumberFormat('ru-RU').format(Number(value))} sum`

  async function hydrateSession() {
    try {
      const profile = await authApi.me()
      setUser(profile)
      await fetchCart()
    } catch (err) {
      console.error(err)
      localStorage.removeItem('token')
    }
  }

  async function fetchCategories() {
    try {
      const data = await categoryApi.list()
      setCategories(data)
    } catch (err) {
      console.error(err)
      setMessage('Kategoriyalarni olishda xatolik')
    }
  }

  async function fetchProducts(categoryId = null) {
    try {
      const data = await productApi.list(
        categoryId ? { category_id: categoryId } : undefined
      )
      setProducts(data)
    } catch (err) {
      console.error(err)
      setMessage('Mahsulotlarni olishda xatolik')
    }
  }

  async function fetchCart() {
    try {
      const data = await cartApi.get()
      setCart({ items: data.items || [], total: data.total || 0 })
    } catch (err) {
      console.error(err)
      setMessage('Savatni olishda xatolik')
    }
  }

  const handleAdminLogin = async (payload) => {
    setLoading(true)
    setMessage('')
    try {
      const data = await authApi.login(payload)
      localStorage.setItem('token', data.access_token)
      const profile = await authApi.me()
      if (!profile.is_admin) {
        setMessage('Bu foydalanuvchi admin emas')
        localStorage.removeItem('token')
        return
      }
      setUser(profile)
      await fetchCart()
      setAdminModalOpen(false)
    } catch (err) {
      console.error(err)
      setMessage('Admin login xatolik: foydalanuvchi yoki parol noto\'g\'ri')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setCart({ items: [], total: 0 })
    setAdminModalOpen(false)
  }
  const recalcLocalCart = (items) => {
    const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
    return { items, total }
  }

  const addToLocalCart = (productId, quantity = 1) => {
    const product = products.find((p) => p.id === productId)
    if (!product) {
      setMessage('Mahsulot topilmadi')
      return
    }
    setLocalCart((prev) => {
      const existing = prev.items.find((i) => i.id === productId)
      let newItems
      if (existing) {
        newItems = prev.items.map((i) =>
          i.id === productId ? { ...i, quantity: i.quantity + quantity } : i
        )
      } else {
        newItems = [...prev.items, { id: productId, product, quantity }]
      }
      return recalcLocalCart(newItems)
    })
  }

  const updateLocalQty = (itemId, quantity) => {
    setLocalCart((prev) => {
      if (quantity <= 0) {
        const filtered = prev.items.filter((i) => i.id !== itemId)
        return recalcLocalCart(filtered)
      }
      const updated = prev.items.map((i) =>
        i.id === itemId ? { ...i, quantity } : i
      )
      return recalcLocalCart(updated)
    })
  }

  const removeLocalItem = (itemId) => {
    setLocalCart((prev) => recalcLocalCart(prev.items.filter((i) => i.id !== itemId)))
  }

  const clearLocalCart = () => {
    setLocalCart({ items: [], total: 0 })
  }

  const handleAddToCart = async (productId) => {
    if (!user) {
      addToLocalCart(productId, 1)
      return
    }
    try {
      await cartApi.add({ product_id: productId, quantity: 1 })
      await fetchCart()
    } catch (err) {
      console.error(err)
      setMessage('Savatga qo\'shishda xatolik')
    }
  }

  const handleUpdateQty = async (itemId, quantity) => {
    if (!user) {
      updateLocalQty(itemId, quantity)
      return
    }
    try {
      await cartApi.update(itemId, quantity)
      await fetchCart()
    } catch (err) {
      console.error(err)
      setMessage('Miqdorni yangilashda xatolik')
    }
  }

  const handleRemoveItem = async (itemId) => {
    if (!user) {
      removeLocalItem(itemId)
      return
    }
    try {
      await cartApi.remove(itemId)
      await fetchCart()
    } catch (err) {
      console.error(err)
      setMessage('Savatdan o\'chirishda xatolik')
    }
  }

  const handleClearCart = async () => {
    if (!user) {
      clearLocalCart()
      return
    }
    try {
      await cartApi.clear()
      await fetchCart()
    } catch (err) {
      console.error(err)
      setMessage('Savatni tozalashda xatolik')
    }
  }

  const handleCopyCart = async () => {
    const items = displayedCart.items || []
    if (!items.length) return
    const lines = items.map((item) => {
      const total = item.product.price * item.quantity
      return `${item.product.name} - ${item.quantity} dona - ${formatPrice(total)}`
    })
    const text = lines.join('\n')
    
    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text)
        setMessage('Savat nusxalandi ✓')
        setTimeout(() => setMessage(''), 2000)
        return
      } catch (err) {
        console.error('Clipboard API failed:', err)
      }
    }
    
    // Fallback: create temporary textarea
    try {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      textarea.setSelectionRange(0, 99999) // Mobile compatibility
      const success = document.execCommand('copy')
      document.body.removeChild(textarea)
      
      if (success) {
        setMessage('Savat nusxalandi ✓')
        setTimeout(() => setMessage(''), 2000)
      } else {
        setMessage('Nusxalashda xatolik')
      }
    } catch (err) {
      console.error(err)
      setMessage('Nusxalashda xatolik')
    }
  }

  const handleSaveCategory = async (e) => {
    e.preventDefault()
    try {
      await categoryApi.create(categoryForm)
      setCategoryForm(initialCategoryForm)
      await fetchCategories()
    } catch (err) {
      console.error(err)
      setMessage('Kategoriya yaratishda xatolik')
    }
  }

  const handleDeleteCategory = async (id) => {
    try {
      await categoryApi.remove(id)
      await fetchCategories()
    } catch (err) {
      console.error(err)
      setMessage('Kategoriyani o\'chirishda xatolik')
    }
  }

  const handleSaveProduct = async (e) => {
    e.preventDefault()
    try {
      if (editingProductId) {
        await productApi.update(editingProductId, productForm)
      } else {
        await productApi.create(productForm)
      }
      setProductForm(initialProductForm)
      setEditingProductId(null)
      await fetchProducts(selectedCategory)
    } catch (err) {
      console.error(err)
      setMessage('Mahsulotni saqlashda xatolik')
    }
  }

  const handleEditProduct = (product) => {
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      image_url: product.image_url || '',
      category_id: product.category_id,
      stock: product.stock,
    })
    setEditingProductId(product.id)
  }

  const handleDeleteProduct = async (id) => {
    try {
      await productApi.remove(id)
      await fetchProducts(selectedCategory)
    } catch (err) {
      console.error(err)
      setMessage('Mahsulotni o\'chirishda xatolik')
    }
  }

  const displayedCart = user ? cart : localCart

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">Shirin Magazin</div>
        <div className="topbar-actions">
          {user && user.is_admin && (
            <button className="btn" onClick={() => setShowProductForm(!showProductForm)}>
              Mahsulot qo'shish
            </button>
          )}
          {user && (
            <>
              <button className="btn ghost" onClick={handleLogout}>Chiqish</button>
            </>
          )}
          <button className="btn ghost" onClick={() => setAdminModalOpen(true)}>
            Admin
          </button>
        </div>
      </header>

      {message && <div className="alert">{message}</div>}

      {showProductForm && (
        <section className="panel">
          <div className="panel-head">
            <div>
              <p className="subtle">Admin</p>
              <h2>Mahsulot va kategoriya boshqaruvi</h2>
            </div>
            <button 
              className="btn ghost" 
              onClick={() => setShowProductForm(false)}
              type="button"
            >
              Yopish
            </button>
          </div>
          <div className="admin-grid">
            <form className="form-card" onSubmit={handleSaveCategory}>
              <h3>Kategoriya qo'shish</h3>
              <label>
                Nomi
                <input
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  required
                />
              </label>
              <label>
                Tavsif
                <input
                  value={categoryForm.description}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, description: e.target.value })
                  }
                />
              </label>
              <button className="btn" type="submit">Saqlash</button>
              <div className="admin-list">
                {categories.map((cat) => (
                  <div key={cat.id} className="row">
                    <span>{cat.name}</span>
                    <button className="icon-btn" onClick={() => handleDeleteCategory(cat.id)} type="button">
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </form>

            <form className="form-card" onSubmit={handleSaveProduct}>
              <div className="form-head">
                <h3>{editingProductId ? 'Mahsulotni tahrirlash' : "Mahsulot qo'shish"}</h3>
                {editingProductId && (
                  <button
                    className="btn ghost"
                    type="button"
                    onClick={() => {
                      setEditingProductId(null)
                      setProductForm(initialProductForm)
                    }}
                  >
                    Bekor qilish
                  </button>
                )}
              </div>
              <label>
                Nomi
                <input
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  required
                />
              </label>
              <label>
                Tavsif
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  required
                />
              </label>
              <label>
                Narx
                <input
                  type="number"
                  step="0.01"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                  required
                />
              </label>
              <label>
                Rasm URL
                <input
                  value={productForm.image_url}
                  onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                />
              </label>
              <label>
                Kategoriya
                <select
                  value={productForm.category_id}
                  onChange={(e) => setProductForm({ ...productForm, category_id: Number(e.target.value) })}
                  required
                >
                  <option value="" disabled>
                    Tanlang
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Stock
                <input
                  type="number"
                  value={productForm.stock}
                  onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                  required
                />
              </label>
              <button className="btn" type="submit">
                {editingProductId ? 'Yangilash' : "Qo'shish"}
              </button>
              <div className="admin-list">
                {labeledProducts.map((product) => (
                  <div key={product.id} className="row">
                    <span>{product.name}</span>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button className="icon-btn" onClick={() => handleEditProduct(product)} type="button">
                        ✎
                      </button>
                      <button className="icon-btn" onClick={() => handleDeleteProduct(product.id)} type="button">
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </form>
          </div>
        </section>
      )}

      <section className="panel">
        <div className="panel-head">
          <div>
            <p className="subtle">Mahsulotlar</p>
            <h2>Do'kon</h2>
          </div>
        </div>
        <CategoryFilter
          categories={categories}
          activeId={selectedCategory}
          onSelect={setSelectedCategory}
        />
        <div className="filter-bar">
          <input
            type="search"
            placeholder="Nomi bo'yicha qidirish"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="price-range">
            <input
              type="number"
              min="0"
              placeholder="Min narx"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <input
              type="number"
              min="0"
              placeholder="Maks narx"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
        </div>
        <div className="layout">
          <div className="grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={handleAddToCart}
                onEdit={handleEditProduct}
                  formatPrice={formatPrice}
                isAdmin={user?.is_admin}
              />
            ))}
            {filteredProducts.length === 0 && (
              <p className="subtle">Mahsulot topilmadi</p>
            )}
          </div>
          <CartPanel
            cart={displayedCart}
            onUpdateQty={handleUpdateQty}
            onRemove={handleRemoveItem}
            onClear={handleClearCart}
            onCopy={handleCopyCart}
            formatPrice={formatPrice}
          />
        </div>
      </section>

      {showProductForm && (
        <section className="panel">
          <div className="panel-head">
            <div>
              <p className="subtle">Admin</p>
              <h2>Mahsulot va kategoriya boshqaruvi</h2>
            </div>
            <button 
              className="btn ghost" 
              onClick={() => setShowProductForm(false)}
              type="button"
            >
              Yopish
            </button>
          </div>
          <div className="admin-grid">
            <form className="form-card" onSubmit={handleSaveCategory}>
              <h3>Kategoriya qo'shish</h3>
              <label>
                Nomi
                <input
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  required
                />
              </label>
              <label>
                Tavsif
                <input
                  value={categoryForm.description}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, description: e.target.value })
                  }
                />
              </label>
              <button className="btn" type="submit">Saqlash</button>
              <div className="admin-list">
                {categories.map((cat) => (
                  <div key={cat.id} className="row">
                    <span>{cat.name}</span>
                    <button className="icon-btn" onClick={() => handleDeleteCategory(cat.id)} type="button">
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </form>

            <form className="form-card" onSubmit={handleSaveProduct}>
              <div className="form-head">
                <h3>{editingProductId ? 'Mahsulotni tahrirlash' : "Mahsulot qo'shish"}</h3>
                {editingProductId && (
                  <button
                    className="btn ghost"
                    type="button"
                    onClick={() => {
                      setEditingProductId(null)
                      setProductForm(initialProductForm)
                    }}
                  >
                    Bekor qilish
                  </button>
                )}
              </div>
              <label>
                Nomi
                <input
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  required
                />
              </label>
              <label>
                Tavsif
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  required
                />
              </label>
              <label>
                Narx
                <input
                  type="number"
                  step="0.01"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                  required
                />
              </label>
              <label>
                Rasm URL
                <input
                  value={productForm.image_url}
                  onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                />
              </label>
              <label>
                Kategoriya
                <select
                  value={productForm.category_id}
                  onChange={(e) => setProductForm({ ...productForm, category_id: Number(e.target.value) })}
                  required
                >
                  <option value="" disabled>
                    Tanlang
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Soni
                <input
                  type="number"
                  min="0"
                  value={productForm.stock}
                  onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                  required
                />
              </label>
              <div className="form-actions">
                <button className="btn" type="submit">
                  {editingProductId ? 'Yangilash' : 'Qo\'shish'}
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      {adminModalOpen && (
        <div className="modal-backdrop" onClick={() => setAdminModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="form-head">
              <h3>Admin login</h3>
              <button className="icon-btn" onClick={() => setAdminModalOpen(false)}>✕</button>
            </div>
            <label>
              Username
              <input
                value={adminForm.username}
                onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })}
              />
            </label>
            <label>
              Parol
              <input
                type="password"
                value={adminForm.password}
                onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
              />
            </label>
            <div className="form-actions">
              <button
                className="btn"
                onClick={() => handleAdminLogin(adminForm)}
                disabled={loading}
              >
                {loading ? 'Yuklanmoqda...' : 'Kirish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
