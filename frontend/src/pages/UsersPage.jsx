import { useState, useEffect, useCallback, useMemo } from 'react'
import { getUsers, createUser, updateUser, deleteUser } from '../api/userApi'
import UserForm from '../components/UserForm'
import UserTable from '../components/UserTable'
import UserList from '../components/UserList'
import SearchBar from '../components/SearchBar'
import Pagination from '../components/Pagination'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Edit state
  const [editingUser, setEditingUser] = useState(null)

  // View state: 'table' or 'cards'
  const [viewMode, setViewMode] = useState('table')

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  // ── Fetch users ──────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getUsers()
      setUsers(data)
    } catch (err) {
      setError(
        err.message || 'Không thể kết nối đến backend. Hãy kiểm tra server.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // ── Auto-clear notifications ─────────────────────────────────
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3500)
      return () => clearTimeout(timer)
    }
  }, [success])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 6000)
      return () => clearTimeout(timer)
    }
  }, [error])

  // ── Create or Update handler ─────────────────────────────────
  const handleFormSubmit = async (formData) => {
    setSubmitting(true)
    setError(null)
    try {
      if (editingUser) {
        const updated = await updateUser(editingUser.id, formData)
        setSuccess(
          `✅ Đã cập nhật thông tin user "${updated.name}" thành công!`
        )
        setEditingUser(null)
      } else {
        const created = await createUser(formData)
        setSuccess(`✅ Tạo user "${created.name}" thành công!`)
      }
      await fetchUsers()
      return true
    } catch (err) {
      setError(err.message || 'Thao tác thất bại. Vui lòng thử lại.')
      return false
    } finally {
      setSubmitting(false)
    }
  }

  // ── Edit trigger ─────────────────────────────────────────────
  const handleEdit = (user) => {
    setEditingUser(user)
    window.scrollTo({ top: 180, behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    setEditingUser(null)
  }

  // ── Delete user ──────────────────────────────────────────────
  const handleDelete = async (user) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xoá user "${user.name}" (ID #${user.id}) không?`
    )
    if (!confirmed) return

    try {
      setError(null)
      await deleteUser(user.id)
      setSuccess(`🗑️ Đã xoá thành công user "${user.name}".`)
      if (editingUser?.id === user.id) {
        setEditingUser(null)
      }
      await fetchUsers()
    } catch (err) {
      setError(err.message || 'Xoá user thất bại.')
    }
  }

  // ── Filter users ─────────────────────────────────────────────
  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return users
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    )
  }, [users, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)

  const paginatedUsers = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize
    return filteredUsers.slice(start, start + pageSize)
  }, [filteredUsers, safeCurrentPage, pageSize])

  const handleSearchChange = (val) => {
    setSearchQuery(val)
    setCurrentPage(1)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setCurrentPage(1)
  }

  return (
    <div className="users-page">
      {/* Notifications */}
      {error && (
        <div className="alert alert-error" role="alert" id="alert-error">
          <span className="alert-icon">⚠️</span>
          <span className="alert-text">{error}</span>
          <button
            type="button"
            className="alert-close"
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="alert alert-success" role="status" id="alert-success">
          <span className="alert-icon">🎉</span>
          <span className="alert-text">{success}</span>
          <button
            type="button"
            className="alert-close"
            onClick={() => setSuccess(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* Form Component (Create & Update) */}
      <UserForm
        onSubmit={handleFormSubmit}
        editingUser={editingUser}
        onCancelEdit={handleCancelEdit}
        submitting={submitting}
      />

      {/* Main Content Area */}
      <section className="users-section">
        <div className="section-header-bar">
          <div className="section-title-wrap">
            <h2 className="section-title">
              <span>👥</span> Danh Sách Người Dùng
            </h2>
            <span className="badge badge-primary">{users.length} users</span>
          </div>

          <div className="section-actions-wrap">
            {/* View Mode Switcher */}
            <div
              className="view-mode-toggle"
              role="group"
              aria-label="Kiểu hiển thị"
            >
              <button
                id="btn-view-table"
                type="button"
                className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
                title="Dạng bảng"
              >
                📊 Bảng
              </button>
              <button
                id="btn-view-cards"
                type="button"
                className={`toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
                onClick={() => setViewMode('cards')}
                title="Dạng thẻ"
              >
                🗂️ Thẻ
              </button>
            </div>

            {/* Refresh Button */}
            <button
              id="btn-refresh-users"
              type="button"
              className="btn btn-ghost"
              onClick={fetchUsers}
              disabled={loading}
              title="Làm mới danh sách"
            >
              {loading ? '⏳ Đang tải...' : '🔄 Làm mới'}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChange={handleSearchChange}
          onClear={handleClearSearch}
          totalResults={filteredUsers.length}
          totalUsers={users.length}
        />

        {/* Loading Spinner or Content */}
        {loading ? (
          <div className="loading-wrapper" id="users-loading">
            <div className="spinner" />
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              Đang tải danh sách người dùng...
            </p>
          </div>
        ) : (
          <>
            {viewMode === 'table' ? (
              <UserTable
                users={paginatedUsers}
                onEdit={handleEdit}
                onDelete={handleDelete}
                editingUserId={editingUser?.id}
              />
            ) : (
              <UserList
                users={paginatedUsers}
                onEdit={handleEdit}
                onDelete={handleDelete}
                editingUserId={editingUser?.id}
              />
            )}

            {/* Pagination Controls */}
            <Pagination
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize)
                setCurrentPage(1)
              }}
              totalItems={filteredUsers.length}
            />
          </>
        )}
      </section>
    </div>
  )
}
