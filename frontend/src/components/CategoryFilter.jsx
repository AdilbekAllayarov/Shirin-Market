import PropTypes from 'prop-types'

export default function CategoryFilter({ categories, activeId, onSelect }) {
  return (
    <div className="filter-row">
      <button className={activeId === null ? 'chip active' : 'chip'} onClick={() => onSelect(null)}>
        Barchasi
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          className={activeId === cat.id ? 'chip active' : 'chip'}
          onClick={() => onSelect(cat.id)}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )
}

CategoryFilter.propTypes = {
  categories: PropTypes.array.isRequired,
  activeId: PropTypes.number,
  onSelect: PropTypes.func.isRequired,
}
