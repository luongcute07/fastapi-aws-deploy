import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import UserList from './UserList'

describe('UserList Component', () => {
  const mockUsers = [
    { id: 1, name: 'Alice Smith', email: 'alice@example.com' },
    { id: 2, name: 'Bob Johnson', email: 'bob@example.com' },
  ]

  it('renders user cards with id, name, and email', () => {
    render(<UserList users={mockUsers} onEdit={vi.fn()} onDelete={vi.fn()} />)

    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    expect(screen.getByText('alice@example.com')).toBeInTheDocument()
    expect(screen.getByText('ID #1')).toBeInTheDocument()

    expect(screen.getByText('Bob Johnson')).toBeInTheDocument()
    expect(screen.getByText('bob@example.com')).toBeInTheDocument()
    expect(screen.getByText('ID #2')).toBeInTheDocument()
  })

  it('renders empty state when users array is empty', () => {
    render(<UserList users={[]} onEdit={vi.fn()} onDelete={vi.fn()} />)

    expect(screen.getByText('Không tìm thấy user nào')).toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked in card', () => {
    const onEdit = vi.fn()
    render(<UserList users={mockUsers} onEdit={onEdit} onDelete={vi.fn()} />)

    const editBtns = screen.getAllByRole('button', { name: /Sửa/i })
    fireEvent.click(editBtns[0])

    expect(onEdit).toHaveBeenCalledWith(mockUsers[0])
  })

  it('calls onDelete when delete button is clicked in card', () => {
    const onDelete = vi.fn()
    render(<UserList users={mockUsers} onEdit={vi.fn()} onDelete={onDelete} />)

    const deleteBtns = screen.getAllByRole('button', { name: /Xoá/i })
    fireEvent.click(deleteBtns[1])

    expect(onDelete).toHaveBeenCalledWith(mockUsers[1])
  })
})
