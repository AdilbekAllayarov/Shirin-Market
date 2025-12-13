import PropTypes from 'prop-types'

export default function ProductCard({ product, onAdd, onEdit, isAdmin = false, formatPrice }) {
  return (
    <div className="card">
      {product.image_url ? (
        <div className="card-media">
          <img
            src={product.image_url}
            alt={product.name}
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image'
            }}
          />
        </div>
      ) : (
        <div className="card-placeholder">IMG</div>
      )}
      <div className="card-body">
        <div className="card-meta">
          <span className="pill">{product.category?.name || 'No category'}</span>
          <span className="pill pill-ghost">Stock: {product.stock}</span>
        </div>
        <h3 className="card-title">{product.name}</h3>
        <p className="card-desc">{product.description}</p>
        <div className="card-footer">
          <span className="price">{formatPrice(product.price)}</span>
          <div className="card-actions">
            <button className="btn" onClick={() => onAdd(product.id)}>
              Savatga qo'shish
            </button>
            {isAdmin && (
              <button className="btn ghost" onClick={() => onEdit(product)}>
                Tahrirlash
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

ProductCard.propTypes = {
  product: PropTypes.object.isRequired,
  onAdd: PropTypes.func.isRequired,
  onEdit: PropTypes.func,
  isAdmin: PropTypes.bool,
  formatPrice: PropTypes.func.isRequired,
}
