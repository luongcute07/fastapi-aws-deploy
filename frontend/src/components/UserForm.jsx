import { useState, useEffect } from 'react'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function UserForm({
  onSubmit,
  editingUser = null,
  onCancelEdit,
  submitting = false,
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [validationError, setValidationError] = useState('')

  // Sync form values when editingUser changes
  useEffect(() => {
    if (editingUser) {
      setName(editingUser.name || '')
      setEmail(editingUser.email || '')
      setValidationError('')
    } else {
      setName('')
      setEmail('')
      setValidationError('')
    }
  }, [editingUser])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmedName = name.trim()
    const trimmedEmail = email.trim()

    // Validation
    if (!trimmedName) {
      setValidationError('Vui lòng nhập Họ và Tên.')
      return
    }
    if (!trimmedEmail) {
      setValidationError('Vui lòng nhập Địa chỉ Email.')
      return
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setValidationError(
        'Định dạng email không hợp lệ (ví dụ: user@example.com).'
      )
      return
    }

    setValidationError('')
    const success = await onSubmit({ name: trimmedName, email: trimmedEmail })
    if (success && !editingUser) {
      setName('')
      setEmail('')
    }
  }

  const isEditing = Boolean(editingUser)

  return (
    <div className={`form-card ${isEditing ? 'form-card-editing' : ''}`}>
      <div className="form-card-header">
        <h2 className="section-title">
          <span>{isEditing ? '✏️' : '✨'}</span>
          {isEditing ? `Cập Nhật User #${editingUser.id}` : 'Tạo User Mới'}
        </h2>
        {isEditing && (
          <span className="badge badge-warning">Đang chỉnh sửa</span>
        )}
      </div>

      {validationError && (
        <div
          className="alert alert-error"
          role="alert"
          style={{ marginBottom: 16 }}
        >
          ⚠️ {validationError}
        </div>
      )}

      <form onSubmit={handleSubmit} id="user-form" noValidate>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="input-name">
              Họ và Tên <span className="text-danger">*</span>
            </label>
            <input
              id="input-name"
              className="form-input"
              type="text"
              placeholder="Nguyễn Văn A"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (validationError) setValidationError('')
              }}
              disabled={submitting}
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label htmlFor="input-email">
              Email <span className="text-danger">*</span>
            </label>
            <input
              id="input-email"
              className="form-input"
              type="email"
              placeholder="nguyenvana@gmail.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (validationError) setValidationError('')
              }}
              disabled={submitting}
              autoComplete="off"
            />
          </div>

          <div className="form-actions">
            <button
              id="btn-submit-user"
              type="submit"
              className={`btn ${isEditing ? 'btn-warning' : 'btn-primary'}`}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="btn-spinner" /> Đang xử lý...
                </>
              ) : isEditing ? (
                '💾 Lưu Cập Nhật'
              ) : (
                '➕ Tạo User'
              )}
            </button>

            {isEditing && (
              <button
                id="btn-cancel-edit"
                type="button"
                className="btn btn-ghost"
                onClick={onCancelEdit}
                disabled={submitting}
              >
                ✖️ Huỷ
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
