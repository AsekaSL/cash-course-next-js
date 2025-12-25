'use client'

import { useState } from "react";

type Props = { slug: string }

const BookEvent = ({ slug }: Props) => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e:React.FormEvent) => {
        e.preventDefault();
        setError(null)

        if (!email || !email.includes('@')) {
            setError('Please enter a valid email address')
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug, email }),
            })

            if (!res.ok) {
                const payload = await res.json().catch(() => ({}))
                const msg = payload?.error || 'Failed to create booking'
                setError(msg)
                console.error('Booking error:', msg)
            } else {
                setSubmitted(true)
            }
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Network error while creating booking:', err)
            setError('Network error while creating booking')
        } finally {
            setLoading(false)
        }
    }

  return (
    <div id='book-event'>{
        submitted ? (
            <p className="text-sm">Thank you for signing up!</p>

        ) : (
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        required
                    />
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button type="submit" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit'}
                </button>
            </form>
        )
    }</div>
  )
}

export default BookEvent