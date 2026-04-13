import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Download,
  ExternalLink,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/features/products/components/ProductCard'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import type { ProductWithImages } from '@/types/database.types'
import {
  getQuestionsForWorkflow,
  isWorkflowKey,
  pdfTemplates,
  workflowDefinitions,
  type AdvisorAnswers,
  type AdvisorQuestionId,
} from '@/features/advisor/data/workflowAdvisorData'
import {
  buildAdvisorTarget,
  getCompatibleProducts,
} from '@/features/advisor/lib/recommendationEngine'
import { downloadPdf } from '@/features/advisor/lib/pdf'

const LAST_REVIEWED_LABEL = 'Online references reviewed: March 29, 2026'

// ── Reusable card wrapper used throughout this page ────────────────
function AdvisorCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-3xl bg-surface-raised border border-border-faint p-7 sm:p-9', className)}>
      {children}
    </div>
  )
}

export function WorkflowAdvisorPage() {
  const { workflow: workflowParam } = useParams()
  const workflow = isWorkflowKey(workflowParam)
    ? workflowDefinitions[workflowParam]
    : null
  const activeWorkflow = workflow ?? workflowDefinitions.creators

  const questions = useMemo(
    () => getQuestionsForWorkflow(activeWorkflow),
    [activeWorkflow],
  )

  const [answers, setAnswers] = useState<AdvisorAnswers>({})
  const [stepIndex, setStepIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    setAnswers({})
    setStepIndex(0)
    setIsComplete(false)
  }, [workflowParam])

  const {
    data: products = [],
    isLoading: productsLoading,
    error: productsError,
  } = useQuery({
    queryKey: ['advisor-products'],
    enabled: !!workflow,
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_images (*)')
        .gt('stock_quantity', 0)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data as ProductWithImages[]) ?? []
    },
  })

  const currentQuestion = questions[stepIndex]
  const selectedCurrentOption = currentQuestion ? answers[currentQuestion.id] : undefined

  const recommendation = useMemo(
    () => buildAdvisorTarget(activeWorkflow, answers),
    [activeWorkflow, answers],
  )

  const matches = useMemo(
    () => isComplete ? getCompatibleProducts(products, recommendation).slice(0, 6) : [],
    [isComplete, products, recommendation],
  )

  const answerQuestion = (questionId: AdvisorQuestionId, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  const goNext = () => {
    if (!currentQuestion || !answers[currentQuestion.id]) return
    if (stepIndex >= questions.length - 1) { setIsComplete(true); return }
    setStepIndex(prev => prev + 1)
  }

  const goBack = () => {
    if (isComplete) { setIsComplete(false); setStepIndex(questions.length - 1); return }
    setStepIndex(prev => Math.max(0, prev - 1))
  }

  const restart = () => { setAnswers({}); setStepIndex(0); setIsComplete(false) }

  const handleDownload = (templateId: string) => {
    const baseFile = `${activeWorkflow.key}-${templateId}-${new Date().toISOString().slice(0, 10)}`

    if (templateId === 'recommendation-summary') {
      downloadPdf({
        fileName: baseFile,
        title: `${activeWorkflow.title} laptop recommendation summary`,
        sections: [
          { heading: 'Recommended reference profile', lines: [recommendation.referenceProfile, recommendation.summary] },
          { heading: 'Must have', lines: recommendation.mustHave },
          { heading: 'Better to have', lines: recommendation.betterToHave },
          {
            heading: 'Top matching products from our store',
            lines: matches.length > 0
              ? matches.map(m => `${m.product.name} (score ${m.score}/100)`)
              : ['No direct match currently in stock'],
          },
        ],
      })
      return
    }

    if (templateId === 'buying-checklist') {
      downloadPdf({
        fileName: baseFile,
        title: 'Laptop buying checklist',
        sections: [
          {
            heading: 'Before purchase',
            lines: [
              'Check RAM and storage upgradeability',
              'Confirm battery health and charger quality',
              'Verify screen quality and keyboard comfort',
              'Confirm warranty coverage and return policy',
              'Compare at least three models on the same budget',
            ],
          },
          { heading: 'Recommended target from advisor', lines: recommendation.mustHave },
        ],
      })
      return
    }

    downloadPdf({
      fileName: baseFile,
      title: 'Laptop comparison worksheet',
      sections: [{
        heading: 'Use this sheet to compare candidates',
        lines: [
          'Model 1: __________  Price: __________',
          'Model 2: __________  Price: __________',
          'Model 3: __________  Price: __________',
          'CPU / RAM / Storage / GPU comparison',
          'Battery, thermals, weight, and display notes',
          'Final winner and reason',
        ],
      }],
    })
  }

  if (!workflow) {
    return (
      <div className="min-h-[70vh] bg-surface-sunken px-4 py-16 sm:px-6 lg:px-8">
        <AdvisorCard className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">Workflow not found</h1>
          <p className="mt-3 text-on-surface-subtle">
            Choose one of the available categories to launch the advisor.
          </p>
          <Button asChild className="mt-6 rounded-full">
            <Link to="/">Back to home</Link>
          </Button>
        </AdvisorCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-sunken">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue hover:text-brand-blue/80 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to categories
        </Link>

        {/* ── Workflow header ── */}
        <AdvisorCard className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-faint">
                Workflow advisor
              </p>
              <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
                {workflow.title}
              </h1>
              <p className="mt-2 max-w-3xl text-on-surface-subtle">{workflow.intro}</p>
            </div>
            <div className="rounded-2xl bg-brand-blue/10 px-4 py-3 text-sm text-brand-blue ring-1 ring-brand-blue/20">
              <p className="font-semibold">{LAST_REVIEWED_LABEL}</p>
              <p className="mt-1 text-xs opacity-80">Recommendations are adapted from official requirement pages.</p>
            </div>
          </div>
        </AdvisorCard>

        {/* ── Question step ── */}
        {!isComplete && currentQuestion && (
          <AdvisorCard className="mt-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-on-surface-subtle">
                Question {stepIndex + 1} of {questions.length}
              </p>
              <div className="h-2 w-36 overflow-hidden rounded-full bg-surface-sunken">
                <div
                  className="h-full rounded-full bg-brand-blue transition-all duration-300"
                  style={{ width: `${((stepIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            <h2 className="mt-5 text-2xl font-bold tracking-tight text-on-surface">
              {currentQuestion.title}
            </h2>
            <p className="mt-2 text-on-surface-subtle">{currentQuestion.subtitle}</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {currentQuestion.options.map(option => {
                const isSelected = answers[currentQuestion.id] === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => answerQuestion(currentQuestion.id, option.value)}
                    className={cn(
                      'rounded-2xl border p-4 text-left transition-all',
                      isSelected
                        ? 'border-brand-blue bg-brand-blue/8 shadow-[0_10px_26px_rgba(15,93,207,0.12)]'
                        : 'border-border-subtle bg-surface-raised hover:border-brand-blue/40',
                    )}
                  >
                    <p className="font-semibold text-on-surface">{option.label}</p>
                    <p className="mt-1.5 text-sm text-on-surface-subtle">{option.description}</p>
                  </button>
                )
              })}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button type="button" variant="outline" className="rounded-full" onClick={goBack} disabled={stepIndex === 0}>
                Back
              </Button>
              <Button type="button" className="rounded-full" onClick={goNext} disabled={!selectedCurrentOption}>
                {stepIndex === questions.length - 1 ? 'Get recommendation' : 'Next question'}
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </AdvisorCard>
        )}

        {/* ── Results ── */}
        {isComplete && (
          <div className="mt-6 space-y-6">
            {/* Recommendation */}
            <AdvisorCard>
              <div className="flex items-center gap-2 text-brand-blue">
                <Sparkles className="h-5 w-5" />
                <p className="text-sm font-semibold uppercase tracking-[0.12em]">Recommended reference</p>
              </div>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-on-surface">
                {recommendation.referenceProfile}
              </h2>
              <p className="mt-3 max-w-3xl text-on-surface-subtle">{recommendation.summary}</p>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                {/* Must-have */}
                <div className="rounded-2xl border border-brand-blue/20 bg-brand-blue/5 p-5">
                  <p className="text-sm font-semibold text-brand-blue">What to buy (must-have)</p>
                  <ul className="mt-3 space-y-2 text-sm text-on-surface-muted">
                    {recommendation.mustHave.map(item => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Better to have */}
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Better to have (recommended upgrades)</p>
                  <ul className="mt-3 space-y-2 text-sm text-on-surface-muted">
                    {recommendation.betterToHave.map(item => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* PDF downloads */}
              <div className="mt-7 rounded-2xl border border-border-subtle bg-surface-sunken p-5">
                <p className="text-sm font-semibold text-on-surface">Downloadable PDFs</p>
                <p className="mt-1 text-sm text-on-surface-subtle">
                  Install/download these files to keep your recommendation and checklist.
                </p>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {pdfTemplates.map(template => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => handleDownload(template.id)}
                      className="rounded-xl border border-border-subtle bg-surface-raised px-4 py-3 text-left transition hover:border-brand-blue/50 hover:bg-brand-blue/5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-on-surface">{template.title}</p>
                        <Download className="h-4 w-4 text-brand-blue" />
                      </div>
                      <p className="mt-1.5 text-xs text-on-surface-subtle">{template.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </AdvisorCard>

            {/* Online sources */}
            <AdvisorCard>
              <h3 className="text-2xl font-bold tracking-tight text-on-surface">
                Online references used for this advisor
              </h3>
              <p className="mt-2 text-sm text-on-surface-subtle">
                These sources inform the recommendation thresholds and buying priorities.
              </p>
              <div className="mt-4 space-y-2">
                {workflow.onlineSources.map(source => (
                  <a
                    key={source.url}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-3 rounded-xl border border-border-subtle bg-surface-sunken px-4 py-3 transition hover:border-brand-blue/40"
                  >
                    <div>
                      <p className="font-semibold text-on-surface">{source.title}</p>
                      <p className="text-xs text-on-surface-faint">{source.publisher}</p>
                    </div>
                    <ExternalLink className="h-4 w-4 shrink-0 text-brand-blue" />
                  </a>
                ))}
              </div>
            </AdvisorCard>

            {/* Product matches */}
            <AdvisorCard>
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-2xl font-bold tracking-tight text-on-surface">
                  Most compatible products in our store
                </h3>
                <Button type="button" variant="outline" className="rounded-full" onClick={restart}>
                  Start over
                </Button>
              </div>

              {productsLoading && (
                <p className="mt-4 text-sm text-on-surface-subtle">Checking catalog compatibility...</p>
              )}

              {productsError && (
                <p className="mt-4 text-sm text-red-600">
                  We could not load the catalog right now. Please try again.
                </p>
              )}

              {!productsLoading && !productsError && matches.length > 0 && (
                <>
                  <p className="mt-2 text-sm text-on-surface-subtle">
                    Showing the top matches based on your answers and currently in-stock products.
                  </p>
                  <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {matches.map(match => (
                      <div key={match.product.id} className="space-y-2">
                        <ProductCard product={match.product} />
                        <div className="rounded-xl border border-brand-blue/20 bg-brand-blue/5 px-3 py-2 text-xs text-brand-blue">
                          Compatibility score: <span className="font-semibold">{match.score}/100</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {!productsLoading && !productsError && matches.length === 0 && (
                <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
                  <p className="font-semibold text-red-600 dark:text-red-400">
                    We do not have an exact compatible product for this profile right now.
                  </p>
                  <p className="mt-1.5 text-sm text-on-surface-subtle">
                    Keep checking from time to time because we add new deals regularly, and a better match may appear soon.
                  </p>
                </div>
              )}
            </AdvisorCard>
          </div>
        )}
      </div>
    </div>
  )
}
