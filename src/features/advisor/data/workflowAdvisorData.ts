export type WorkflowKey = 'creators' | 'developers' | 'business' | 'gaming'

export type AdvisorQuestionId =
  | 'primaryUse'
  | 'budget'
  | 'portability'
  | 'multitasking'
  | 'performance'
  | 'display'

export type AdvisorAnswers = Partial<Record<AdvisorQuestionId, string>>

export interface AdvisorOption {
  value: string
  label: string
  description: string
}

export interface AdvisorQuestion {
  id: AdvisorQuestionId
  title: string
  subtitle: string
  options: AdvisorOption[]
}

export interface OnlineSource {
  title: string
  publisher: string
  url: string
}

export interface PdfTemplate {
  id: string
  title: string
  description: string
}

export interface WorkflowBaseline {
  minRamGb: number
  idealRamGb: number
  minStorageGb: number
  idealStorageGb: number
  minCpuTier: number
  idealCpuTier: number
  minGpuTier: number
  idealGpuTier: number
  requiresDedicatedGpu: boolean
  preferredMaxScreenInches?: number
}

export interface WorkflowDefinition {
  key: WorkflowKey
  title: string
  subtitle: string
  intro: string
  baseline: WorkflowBaseline
  primaryUseOptions: AdvisorOption[]
  onlineSources: OnlineSource[]
}

const sharedQuestions: AdvisorQuestion[] = [
  {
    id: 'budget',
    title: 'What budget range are you targeting?',
    subtitle: 'This helps balance performance and value.',
    options: [
      { value: 'value', label: 'Value (up to 5,000 MAD)', description: 'Best price and essential specs first.' },
      { value: 'balanced', label: 'Balanced (5,000-10,000 MAD)', description: 'Strong performance without overspending.' },
      { value: 'performance', label: 'Performance (10,000-16,000 MAD)', description: 'Higher-end hardware for heavy workloads.' },
      { value: 'premium', label: 'Premium (16,000+ MAD)', description: 'Top specs and fewer compromises.' },
    ],
  },
  {
    id: 'portability',
    title: 'How important is portability?',
    subtitle: 'Portable laptops usually trade some peak power.',
    options: [
      { value: 'high', label: 'Very important', description: 'Lightweight and easy to carry daily.' },
      { value: 'medium', label: 'Balanced', description: 'Portability matters, but not at all costs.' },
      { value: 'low', label: 'Not important', description: 'Performance and larger screens can take priority.' },
    ],
  },
  {
    id: 'multitasking',
    title: 'How intense is your multitasking?',
    subtitle: 'More browser tabs, apps, and tools need more RAM.',
    options: [
      { value: 'light', label: 'Light', description: 'Email, docs, meetings, and light browsing.' },
      { value: 'medium', label: 'Medium', description: 'Many tabs + office/dev/creative apps open together.' },
      { value: 'heavy', label: 'Heavy', description: 'Large projects, virtual machines, rendering, or AI tools.' },
    ],
  },
  {
    id: 'performance',
    title: 'Which performance style fits you?',
    subtitle: 'Choose if you prefer efficiency or raw speed.',
    options: [
      { value: 'efficient', label: 'Efficiency first', description: 'Cooler, quieter, and battery-oriented setup.' },
      { value: 'balanced', label: 'Balanced', description: 'A good mix of performance and battery life.' },
      { value: 'max', label: 'Maximum performance', description: 'Highest power for demanding tasks.' },
    ],
  },
  {
    id: 'display',
    title: 'Which display preference matters most?',
    subtitle: 'Different work styles need different panels.',
    options: [
      { value: 'standard', label: 'Standard', description: 'General-purpose display quality.' },
      { value: 'color', label: 'Color accuracy', description: 'Better panels for design, content, and editing.' },
      { value: 'refresh', label: 'High refresh rate', description: 'Smoother motion for gaming and fast interaction.' },
    ],
  },
]

export const workflowDefinitions: Record<WorkflowKey, WorkflowDefinition> = {
  creators: {
    key: 'creators',
    title: 'For creators',
    subtitle: 'Video, design, and content production workflows',
    intro: 'This advisor favors color quality, GPU acceleration, and memory headroom for creative apps.',
    baseline: {
      minRamGb: 16,
      idealRamGb: 32,
      minStorageGb: 512,
      idealStorageGb: 1000,
      minCpuTier: 3,
      idealCpuTier: 4,
      minGpuTier: 2,
      idealGpuTier: 4,
      requiresDedicatedGpu: true,
    },
    primaryUseOptions: [
      { value: 'video', label: 'Video editing', description: '4K timelines, effects, and export performance.' },
      { value: 'design', label: 'Graphic/UI design', description: 'Color consistency, smooth previews, and fast assets.' },
      { value: '3d', label: '3D and rendering', description: 'GPU and CPU heavy projects with larger files.' },
    ],
    onlineSources: [
      { title: 'Premiere Pro System Requirements', publisher: 'Adobe', url: 'https://helpx.adobe.com/premiere-pro/system-requirements.html' },
      { title: 'DaVinci Resolve Tech Specs', publisher: 'Blackmagic Design', url: 'https://www.blackmagicdesign.com/products/davinciresolve/techspecs' },
      { title: 'NVIDIA Studio Laptops', publisher: 'NVIDIA', url: 'https://www.nvidia.com/en-us/studio/laptops-desktops-with-adobe-cc/' },
    ],
  },
  developers: {
    key: 'developers',
    title: 'For developers',
    subtitle: 'Compilers, containers, local tooling, and IDE workloads',
    intro: 'This advisor prioritizes RAM, multi-core CPUs, and fast SSDs for daily development velocity.',
    baseline: {
      minRamGb: 16,
      idealRamGb: 32,
      minStorageGb: 512,
      idealStorageGb: 1000,
      minCpuTier: 3,
      idealCpuTier: 4,
      minGpuTier: 1,
      idealGpuTier: 2,
      requiresDedicatedGpu: false,
    },
    primaryUseOptions: [
      { value: 'web', label: 'Web and backend', description: 'Editor, browser, local services, and database tools.' },
      { value: 'mobile', label: 'Mobile development', description: 'Android/iOS emulators and build pipelines.' },
      { value: 'ai', label: 'Local AI and data work', description: 'Inference, notebooks, and GPU-assisted workloads.' },
    ],
    onlineSources: [
      { title: 'Docker Desktop on Windows', publisher: 'Docker Docs', url: 'https://docs.docker.com/desktop/setup/install/windows-install/' },
      { title: 'Visual Studio 2022 System Requirements', publisher: 'Microsoft Learn', url: 'https://learn.microsoft.com/en-us/visualstudio/releases/2022/system-requirements' },
      { title: 'Install Android Studio', publisher: 'Android Developers', url: 'https://developer.android.com/studio/install' },
    ],
  },
  business: {
    key: 'business',
    title: 'For business',
    subtitle: 'Productivity, mobility, and reliable daily operation',
    intro: 'This advisor emphasizes battery life balance, portability, and consistent office productivity.',
    baseline: {
      minRamGb: 8,
      idealRamGb: 16,
      minStorageGb: 256,
      idealStorageGb: 512,
      minCpuTier: 2,
      idealCpuTier: 3,
      minGpuTier: 1,
      idealGpuTier: 1,
      requiresDedicatedGpu: false,
      preferredMaxScreenInches: 14.2,
    },
    primaryUseOptions: [
      { value: 'office', label: 'Office productivity', description: 'Spreadsheets, presentations, and collaboration.' },
      { value: 'meetings', label: 'Remote meetings', description: 'Video calls with stable all-day performance.' },
      { value: 'travel', label: 'Frequent travel', description: 'Portable machine for daily commuting and trips.' },
    ],
    onlineSources: [
      { title: 'Windows 11 Specifications', publisher: 'Microsoft', url: 'https://www.microsoft.com/en-us/windows/windows-11-specifications' },
      { title: 'Teams Hardware Requirements', publisher: 'Microsoft Learn', url: 'https://learn.microsoft.com/en-us/microsoftteams/hardware-requirements-for-the-teams-app' },
      { title: 'Windows 11 Minimum Hardware Requirements', publisher: 'Microsoft Learn', url: 'https://learn.microsoft.com/en-us/windows/whats-new/windows-11-requirements' },
    ],
  },
  gaming: {
    key: 'gaming',
    title: 'For gaming',
    subtitle: 'High FPS performance and graphics-first priorities',
    intro: 'This advisor focuses on stronger GPUs, thermals, and fast displays for smooth gameplay.',
    baseline: {
      minRamGb: 16,
      idealRamGb: 32,
      minStorageGb: 512,
      idealStorageGb: 1000,
      minCpuTier: 3,
      idealCpuTier: 4,
      minGpuTier: 3,
      idealGpuTier: 5,
      requiresDedicatedGpu: true,
    },
    primaryUseOptions: [
      { value: 'esports', label: 'Esports titles', description: 'High frame rates and responsive gameplay.' },
      { value: 'aaa', label: 'AAA titles', description: 'Higher graphics settings and visual quality.' },
      { value: 'stream', label: 'Gaming + streaming', description: 'Extra overhead for streaming and recording.' },
    ],
    onlineSources: [
      { title: 'Steam Hardware and Software Survey', publisher: 'Steam', url: 'https://store.steampowered.com/hwsurvey/' },
      { title: 'GeForce RTX Laptops', publisher: 'NVIDIA', url: 'https://www.nvidia.com/en-us/geforce/laptops/' },
      { title: 'DirectX 12 Requirements', publisher: 'Microsoft Learn', url: 'https://learn.microsoft.com/en-us/windows/win32/direct3d12/hardware-feature-levels' },
    ],
  },
}

export const pdfTemplates: PdfTemplate[] = [
  {
    id: 'recommendation-summary',
    title: 'Recommendation Summary',
    description: 'Your answers, target specs, and final buying direction.',
  },
  {
    id: 'buying-checklist',
    title: 'Buying Checklist',
    description: 'Quick checklist you can use before purchasing any laptop.',
  },
  {
    id: 'comparison-sheet',
    title: 'Comparison Sheet',
    description: 'A side-by-side worksheet to compare shortlisted laptops.',
  },
]

export function getQuestionsForWorkflow(
  workflow: WorkflowDefinition,
): AdvisorQuestion[] {
  const primaryQuestion: AdvisorQuestion = {
    id: 'primaryUse',
    title: `What is your main ${workflow.title.toLowerCase()} use case?`,
    subtitle: 'This has the biggest impact on the recommendation.',
    options: workflow.primaryUseOptions,
  }

  return [primaryQuestion, ...sharedQuestions]
}

export function isWorkflowKey(value: string | undefined): value is WorkflowKey {
  return value === 'creators' || value === 'developers' || value === 'business' || value === 'gaming'
}
