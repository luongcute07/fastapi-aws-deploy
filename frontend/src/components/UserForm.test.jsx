import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import UserForm from './UserForm'

describe('UserForm Component', () => {
  it('renders correctly in Create mode', () => {
    render(<UserForm onSubmit={vi.fn()} />)
    expect(screen.getByText('Tạo User Mới')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Nguyễn Văn A')).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText('nguyenvana@gmail.com')
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Tạo User/i })
    ).toBeInTheDocument()
  })

  it('validates empty inputs and shows error', async () => {
    const onSubmit = vi.fn()
    render(<UserForm onSubmit={onSubmit} />)

    const submitBtn = screen.getByRole('button', { name: /Tạo User/i })
    fireEvent.click(submitBtn)

    expect(
      await screen.findByText(/Vui lòng nhập Họ và Tên/i)
    ).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('validates invalid email format', async () => {
    const onSubmit = vi.fn()
    render(<UserForm onSubmit={onSubmit} />)

    const nameInput = screen.getByPlaceholderText('Nguyễn Văn A')
    const emailInput = screen.getByPlaceholderText('nguyenvana@gmail.com')

    fireEvent.change(nameInput, { target: { value: 'Tran Van B' } })
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })

    const submitBtn = screen.getByRole('button', { name: /Tạo User/i })
    fireEvent.click(submitBtn)

    expect(
      await screen.findByText(/Định dạng email không hợp lệ/i)
    ).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('calls onSubmit with form data when inputs are valid', async () => {
    const onSubmit = vi.fn().mockResolvedValue(true)
    render(<UserForm onSubmit={onSubmit} />)

    const nameInput = screen.getByPlaceholderText('Nguyễn Văn A')
    const emailInput = screen.getByPlaceholderText('nguyenvana@gmail.com')

    fireEvent.change(nameInput, { target: { value: 'Tran Van B' } })
    fireEvent.change(emailInput, { target: { value: 'tranvanb@gmail.com' } })

    const submitBtn = screen.getByRole('button', { name: /Tạo User/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Tran Van B',
        email: 'tranvanb@gmail.com',
      })
    })
  })

  it('renders in Edit mode and populates existing user data', () => {
    const userToEdit = { id: 42, name: 'Le Thi C', email: 'lethic@gmail.com' }
    const onCancelEdit = vi.fn()

    render(
      <UserForm
        onSubmit={vi.fn()}
        editingUser={userToEdit}
        onCancelEdit={onCancelEdit}
      />
    )

    expect(screen.getByText('Cập Nhật User #42')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Le Thi C')).toBeInTheDocument()
    expect(screen.getByDisplayValue('lethic@gmail.com')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Lưu Cập Nhật/i })
    ).toBeInTheDocument()

    const cancelBtn = screen.getByRole('button', { name: /Huỷ/i })
    fireEvent.click(cancelBtn)
    expect(onCancelEdit).toHaveBeenCalled()
  })
})
