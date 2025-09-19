import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import App from '../App.jsx';

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.pushState({}, '', '/');
  });

  afterEach(() => {
    cleanup();
  });

  it('renders platform menu when a token is present', () => {
    localStorage.setItem('token', 'test_token');
    localStorage.setItem('user', 'test_user');

    render(<App />);

    expect(screen.getByText(/Choose your destination platform/i)).toBeInTheDocument();
    expect(screen.getByText(/Welcome, test_user/i)).toBeInTheDocument();
  });

  it('redirects to login when no token is stored', async () => {
    render(<App />);

    expect(await screen.findByRole('heading', { name: /login/i })).toBeInTheDocument();
  });
});