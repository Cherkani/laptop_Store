import { useState } from 'react'
import { ArrowRight, TicketPercent } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'
import { ScrollReveal } from './ScrollReveal'

export function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    toast({
      title: "You're subscribed",
      description: 'You will receive updates on new drops and offers.',
    })
    setEmail('')
    setIsLoading(false)
  }

  return (
    <section className="pb-14 pt-12 sm:pb-16 sm:pt-16 lg:pb-20 lg:pt-20">
      <div className="max-w-[1260px] mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#0f172a] via-[#0b2f58] to-[#064e78] px-6 py-10 shadow-[0_20px_45px_rgba(2,34,67,0.42)] sm:px-10 sm:py-12 lg:px-14">
            <div className="pointer-events-none absolute -right-16 -top-12 h-40 w-40 rounded-full bg-[#60a5fa]/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 left-20 h-44 w-44 rounded-full bg-[#2dd4bf]/20 blur-3xl" />
            <div className="max-w-2xl">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/25">
                <TicketPercent className="h-6 w-6" />
              </div>
              <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Savings and offers.
              </h2>
              <p className="mt-3 text-base text-white/80 sm:text-lg">
                Get first access to limited stock deals and weekly pricing drops.
              </p>

              <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  required
                  className="h-12 rounded-full border-white/25 bg-white/15 px-5 text-white placeholder:text-white/50 focus-visible:ring-white/50"
                />
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-12 rounded-full bg-white px-7 font-semibold text-[#0f172a] hover:bg-white/90"
                >
                  {isLoading ? 'Subscribing...' : (
                    <>
                      Subscribe
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
