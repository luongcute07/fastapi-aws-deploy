import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from './App'

// Mock api calls to avoid actual HTTP requests
vi.mock('./api/userApi', () => ({
  getUsers: vi
    .fn()
    .mockResolvedValue([
      { id: 1, name: 'Nguyen Van A', email: 'vana@example.com' },
    ]),
  getUserById: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
}))

vi.mock('./api/users', () => ({
  getUsers: vi
    .fn()
    .mockResolvedValue([
      { id: 1, name: 'Nguyen Van A', email: 'vana@example.com' },
    ]),
  getUserById: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
}))

describe('App Component', () => {
  it('renders header, title, and users table', async () => {
    render(<App />)

    // Check title in header
    expect(screen.getByText('User Management System')).toBeInTheDocument()
    expect(
      screen.getByText(/Final DevOps/i)
    ).toBeInTheDocument()

    // Check loaded user
    const userName = await screen.findByText('Nguyen Van A')
    expect(userName).toBeInTheDocument()
  })
})
