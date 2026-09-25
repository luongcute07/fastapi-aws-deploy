export default function SearchBar({
  value,
  onChange,
  onClear,
  totalResults,
  totalUsers,
}) {
  return (
    <div className="search-bar-container">
      <div className="search-input-wrapper">
        <span className="search-icon">🔍</span>
        <input
          id="search-input"
          type="text"
          className="search-input"
          placeholder="Tìm kiếm user theo tên hoặc email..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
        />
        {value && (
          <button
            id="btn-clear-search"
            type="button"
            className="search-clear-btn"
            onClick={onClear}
            title="Xoá tìm kiếm"
          >
            ✕
          </button>
        )}
      </div>

      <div className="search-results-info">
        {value ? (
          <span className="badge badge-info">
            Tìm thấy {totalResults} / {totalUsers} users
          </span>
        ) : (
          <span className="badge badge-neutral">
            Tổng cộng {totalUsers} users
          </span>
        )}
      </div>
    </div>
  )
}
