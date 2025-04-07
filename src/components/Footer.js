'use client'

import { useState } from 'react'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    setEmail('')
  }

  return (
    <footer className="bg-gray-100 py-6 text-center text-sm text-gray-600 mt-10">
      <div className="max-w-md mx-auto px-4">
        {!submitted ? (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Subscribe to our newsletter"
              className="border px-3 py-2 w-full sm:w-auto rounded"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
            >
              Subscribe
            </button>
          </form>
        ) : (
          <p className="text-green-600">Thanks for subscribing!</p>
        )}
      </div>

      <div className="mt-6">&copy; {new Date().getFullYear()} BizLinker. All rights reserved.</div>
    </footer>
  )
}
