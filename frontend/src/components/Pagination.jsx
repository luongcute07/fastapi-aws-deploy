export default function Pagination({
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  totalItems,
}) {
  if (totalItems === 0) return null

  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  const pages = []
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i)
  }

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        Hiển thị <strong>{startItem}</strong> - <strong>{endItem}</strong> trên{' '}
        <strong>{totalItems}</strong> users
      </div>

      <div className="pagination-controls">
        <label className="page-size-label">
          Mỗi trang:
          <select
            id="select-page-size"
            className="page-size-select"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </label>

        <div className="page-buttons">
          <button
            id="btn-prev-page"
            className="btn btn-ghost page-btn"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            aria-label="Trang trước"
          >
            ◀
          </button>

          {pages.map((p) => (
            <button
              key={p}
              id={`btn-page-${p}`}
              className={`btn page-btn ${p === currentPage ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          ))}

          <button
            id="btn-next-page"
            className="btn btn-ghost page-btn"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            aria-label="Trang sau"
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  )
}
