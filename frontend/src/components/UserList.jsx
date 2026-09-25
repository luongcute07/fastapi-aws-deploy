import { getInitial } from '../utils'

export default function UserList({ users, onEdit, onDelete, editingUserId }) {
  if (users.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🫙</div>
        <h3>Không tìm thấy user nào</h3>
        <p>Thử tìm kiếm với từ khóa khác hoặc tạo user mới.</p>
      </div>
    )
  }

  return (
    <div className="users-list" id="users-card-list">
      {users.map((user) => {
        const isEditing = editingUserId === user.id
        return (
          <div
            key={user.id}
            className={`user-card ${isEditing ? 'user-card-editing' : ''}`}
            id={`user-card-${user.id}`}
          >
            <div className="user-avatar">{getInitial(user.name)}</div>
            <div className="user-info">
              <div className="user-name">
                {user.name}
                {isEditing && (
                  <span
                    className="badge badge-warning"
                    style={{ fontSize: 11, marginLeft: 8 }}
                  >
                    Đang sửa
                  </span>
                )}
              </div>
              <div className="user-email">{user.email}</div>
            </div>
            <div className="user-meta">
              <span className="user-id-badge">ID #{user.id}</span>
              <div className="user-card-actions">
                <button
                  id={`btn-card-edit-${user.id}`}
                  className="btn btn-sm btn-outline-warning"
                  onClick={() => onEdit(user)}
                  title="Chỉnh sửa user"
                >
                  ✏️ Sửa
                </button>
                <button
                  id={`btn-card-delete-${user.id}`}
                  className="btn btn-sm btn-danger"
                  onClick={() => onDelete(user)}
                  title="Xoá user"
                >
                  🗑️ Xoá
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
