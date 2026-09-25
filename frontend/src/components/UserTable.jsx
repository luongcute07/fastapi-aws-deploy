import { getInitial } from '../utils'

export default function UserTable({ users, onEdit, onDelete, editingUserId }) {
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
    <div className="table-wrapper">
      <table className="user-table" id="users-table">
        <thead>
          <tr>
            <th style={{ width: '80px' }}>ID</th>
            <th style={{ width: '60px' }}>Avatar</th>
            <th>Họ và Tên</th>
            <th>Email</th>
            <th style={{ width: '180px', textAlign: 'center' }}>Thao Tác</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isEditing = editingUserId === user.id
            return (
              <tr
                key={user.id}
                id={`user-row-${user.id}`}
                className={isEditing ? 'row-editing' : ''}
              >
                <td>
                  <span className="user-id-badge">#{user.id}</span>
                </td>
                <td>
                  <div className="user-avatar-sm">{getInitial(user.name)}</div>
                </td>
                <td>
                  <div className="user-name-cell">
                    <strong>{user.name}</strong>
                    {isEditing && (
                      <span
                        className="badge badge-warning"
                        style={{ fontSize: 11, marginLeft: 8 }}
                      >
                        Đang sửa
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <span className="user-email-cell">{user.email}</span>
                </td>
                <td>
                  <div className="action-buttons-group">
                    <button
                      id={`btn-edit-${user.id}`}
                      className="btn btn-sm btn-outline-warning"
                      onClick={() => onEdit(user)}
                      title="Chỉnh sửa user"
                    >
                      ✏️ Sửa
                    </button>
                    <button
                      id={`btn-delete-${user.id}`}
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => onDelete(user)}
                      title="Xoá user"
                    >
                      🗑️ Xoá
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
