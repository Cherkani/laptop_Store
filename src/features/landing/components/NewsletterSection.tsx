import { useState } from 'react'
import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'

export function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setIsLoading(true)
    await new Promise(r => setTimeout(r, 800))
    toast({ title: 'You\'re subscribed!', description: 'Thanks for signing up. Watch your inbox for the best deals.', variant: 'default' })
    setEmail('')
    setIsLoading(false)
  }

  return (
    <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-white text-center lg:text-left">
            <div className="flex items-center gap-2 justify-center lg:justify-start mb-3">
              <Mail className="h-6 w-6 text-blue-200" />
              <span className="text-blue-200 text-sm font-medium uppercase tracking-wider">Newsletter</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold">Get the Best Deals First</h2>
            <p className="text-blue-100 mt-2 max-w-md">
              Subscribe to get exclusive offers, new arrivals, and expert buying guides delivered straight to your inbox.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 h-11"
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-white text-blue-700 hover:bg-blue-50 h-11 px-6 font-semibold shrink-0"
            >
              {isLoading ? 'Subscribing...' : 'Subscribe'}
            </Button>
          </form>
        </div>
      </div>
    </section>
  )
}
