'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';

import Form from './ui/Form';
import Input from './ui/Input';
import Button from './ui/Button';
import Card from './ui/Card';

const LoginForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError('Invalid email or password');
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md w-full mx-auto">
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="mt-2 text-sm text-gray-600">
              Please sign in to your account
            </p>
          </div>

          {error && (
            <div className="mb-4">
              <Form.ErrorMessage>{error}</Form.ErrorMessage>
            </div>
          )}

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
          </Form.Group>

          <Form.Group>
            <Form.Label htmlFor="password" required>
              Password
            </Form.Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              icon={LockClosedIcon}
              placeholder="Enter your password"
              fullWidth
            />
          </Form.Group>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                Forgot your password?
              </a>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
            className="mt-4"
          >
            Sign in
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default LoginForm;
