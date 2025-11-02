'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EnvelopeIcon, LockClosedIcon, UserIcon } from '@heroicons/react/24/outline';

import Form from './ui/Form';
import Input from './ui/Input';
import Button from './ui/Button';
import Card from './ui/Card';

const RegisterForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
    };

    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }

      router.push('/login?registered=true');
    } catch (err) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md w-full mx-auto">
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Create an account</h2>
            <p className="mt-2 text-sm text-gray-600">
              Join our community today
            </p>
          </div>

          {error && (
            <div className="mb-4">
              <Form.ErrorMessage>{error}</Form.ErrorMessage>
            </div>
          )}

          <Form.Group>
            <Form.Label htmlFor="name" required>
              Full name
            </Form.Label>
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              icon={UserIcon}
              placeholder="Enter your full name"
              fullWidth
            />
          </Form.Group>

          <Form.Group>
            <Form.Label htmlFor="email" required>
              Email address
            </Form.Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              icon={EnvelopeIcon}
              placeholder="Enter your email"
              fullWidth
            />
            <Form.Description>
              We&apos;ll never share your email with anyone else.
            </Form.Description>
          </Form.Group>

          <Form.Group>
            <Form.Label htmlFor="password" required>
              Password
            </Form.Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              icon={LockClosedIcon}
              placeholder="Create a password"
              fullWidth
            />
          </Form.Group>

          <Form.Group>
            <Form.Label htmlFor="confirmPassword" required>
              Confirm password
            </Form.Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              icon={LockClosedIcon}
              placeholder="Confirm your password"
              fullWidth
            />
          </Form.Group>

          <div className="mt-4">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
            >
              Create account
            </Button>
          </div>

          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <a
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in
            </a>
          </p>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default RegisterForm;
