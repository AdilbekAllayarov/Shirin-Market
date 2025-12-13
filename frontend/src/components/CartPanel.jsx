import PropTypes from 'prop-types'

export default function CartPanel({ cart, onUpdateQty, onRemove, onClear, onCopy, formatPrice }) {
  return (
    <aside className="cart">
      <div className="cart-header">
        <div>
          <p className="subtle">Savat</p>
          <h3>{cart.items.length} ta mahsulot</h3>
        </div>
        <div className="cart-header-actions">
          <button className="btn ghost" onClick={onCopy} disabled={!cart.items.length}>
            Copy
          </button>
          <button className="btn ghost" onClick={onClear} disabled={!cart.items.length}>
            Tozalash
          </button>
        </div>
      </div>
      <div className="cart-items">
        {cart.items.length === 0 && <p className="subtle">Savat bo'sh</p>}
        {cart.items.map((item) => (
          <div key={item.id} className="cart-item">
            <div>
              <p className="cart-title">{item.product.name}</p>
              <p className="subtle">{formatPrice(item.product.price)} × {item.quantity}</p>
            </div>
            <div className="cart-actions">
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => onUpdateQty(item.id, Number(e.target.value))}
              />
              <button className="icon-btn" onClick={() => onRemove(item.id)}>
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="cart-footer">
        <p className="subtle">Umumiy</p>
        <h2>{formatPrice(cart.total)}</h2>
      </div>
    </aside>
  )
}

CartPanel.propTypes = {
  cart: PropTypes.shape({
    items: PropTypes.array.isRequired,
    total: PropTypes.number.isRequired,
  }).isRequired,
  onUpdateQty: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  onCopy: PropTypes.func.isRequired,
  formatPrice: PropTypes.func.isRequired,
}
