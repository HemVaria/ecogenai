import { render, screen, fireEvent } from '@testing-library/react';
import SignupForm from '../components/auth/SignupForm';

describe('SignupForm', () => {
  beforeEach(() => {
    render(<SignupForm />);
  });

  test('renders the signup form', () => {
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  test('validates username field', () => {
    const usernameInput = screen.getByLabelText(/username/i);
    fireEvent.change(usernameInput, { target: { value: '' } });
    expect(screen.getByText(/username is required/i)).toBeInTheDocument();
  });

  test('validates email field', () => {
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
  });

  test('validates password field', () => {
    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(passwordInput, { target: { value: '123' } });
    expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
  });

  test('displays password strength meter', () => {
    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(passwordInput, { target: { value: 'StrongPassword123!' } });
    expect(screen.getByText(/strong/i)).toBeInTheDocument();
  });

  test('submits the form with valid data', () => {
    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'StrongPassword123!' } });
    fireEvent.click(submitButton);

    expect(screen.getByText(/signup successful/i)).toBeInTheDocument();
  });
});