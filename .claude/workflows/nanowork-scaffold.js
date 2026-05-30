export const meta = {
  name: 'nanowork-scaffold',
  description: 'Scaffold a new Nanowork-based application with proven architecture',
  whenToUse: 'When starting a new project based on Nanowork patterns and architecture',
  phases: [
    { title: 'Plan', detail: 'Gather requirements and validate inputs' },
    { title: 'Scaffold', detail: 'Create project structure and base files' },
    { title: 'Configure', detail: 'Set up features and integrations' },
    { title: 'Initialize', detail: 'Install deps, init git, finalize setup' }
  ]
}

const TEMPLATES = {
  minimal: {
    name: 'Minimal',
    description: 'Core structure only (web + worker + backend)',
    features: []
  },
  standard: {
    name: 'Standard',
    description: 'Production-ready with auth, database, common patterns',
    features: ['auth', 'db', 'workers']
  },
  full: {
    name: 'Full',
    description: 'Everything including advanced features',
    features: ['auth', 'db', 'workers', 'payments', 'email', 'analytics', 'storage']
  }
}

const FEATURES = {
  auth: { name: 'Authentication', description: 'Supabase Auth integration' },
  db: { name: 'Database', description: 'Supabase PostgreSQL' },
  payments: { name: 'Payments', description: 'Stripe integration' },
  email: { name: 'Email', description: 'Resend email service' },
  analytics: { name: 'Analytics', description: 'Analytics tracking' },
  monitoring: { name: 'Monitoring', description: 'Error tracking and monitoring' },
  workers: { name: 'Workers', description: 'Cloudflare Workers setup' },
  edge: { name: 'Edge Runtime', description: 'Edge runtime features' },
  realtime: { name: 'Realtime', description: 'Realtime subscriptions' },
  storage: { name: 'Storage', description: 'Supabase Storage for files' }
}

const BASE_PACKAGE_JSON = {
  name: '',
  private: true,
  workspaces: ['apps/*', 'packages/*'],
  scripts: {
    dev: 'turbo dev',
    'dev:web': 'cd apps/web && bun run dev',
    'dev:worker': 'cd apps/worker && npx wrangler dev',
    'dev:backend': 'cd apps/backend && npm run dev',
    build: 'turbo build',
    'build:web': 'cd apps/web && bun run build',
    'build:worker': 'cd apps/worker && npm run build',
    'build:backend': 'cd apps/backend && npm run build',
    start: 'npm run start -w web',
    deploy: 'npm run deploy:worker',
    'deploy:worker': 'cd apps/worker && npx wrangler deploy',
    typecheck: 'turbo typecheck',
    lint: 'turbo lint',
    validate: 'turbo typecheck && turbo lint'
  },
  devDependencies: {
    'turbo': '^2.9.16',
    'typescript': '^5.7.3'
  }
}

const GITIGNORE_CONTENT = `# Dependencies
node_modules/
.pnp
.pnp.js

# Environment variables
.env
.env.*
!.env.example

# Build outputs
dist/
build/
.next/
out/

# Cloudflare
.wrangler/
.dev.vars

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Testing
coverage/

# Misc
.turbo/
`

// Plan phase
phase('Plan')
log('Gathering project requirements...')

const appName = args?.name || 'nanowork-app'
const templateKey = args?.template || 'standard'
const template = TEMPLATES[templateKey] || TEMPLATES.standard
const customFeatures = args?.features ? args.features.split(',').map(f => f.trim()) : []
const selectedFeatures = [...new Set([...template.features, ...customFeatures])]

log(`Creating: ${appName} (${template.name} template)`)
log(`Features: ${selectedFeatures.join(', ') || 'none'}`)

const validation = await agent(
  `Validate this project setup:
  - App name: ${appName}
  - Template: ${template.name}
  - Features: ${selectedFeatures.join(', ')}

  Check:
  1. App name is valid (kebab-case, no special chars except hyphens)
  2. Template exists
  3. Features are valid
  4. Target directory doesn't exist at ./${appName}

  Return validation result with any errors or warnings.`,
  { label: 'validate-inputs' }
)

if (validation?.toLowerCase().includes('error')) {
  throw new Error(`Validation failed: ${validation}`)
}

// Scaffold phase
phase('Scaffold')
log('Creating project structure...')

const scaffoldTasks = [
  {
    label: 'base-structure',
    prompt: `Create the base directory structure for ${appName}:

    ./${appName}/
    ├── apps/
    │   ├── web/
    │   ├── worker/
    │   └── backend/
    ├── packages/
    │   ├── shared/
    │   └── ui/
    ├── .claude/
    ├── .gitignore
    ├── package.json
    ├── turbo.json
    └── tsconfig.json

    Use Write tool to create these directories and base files.
    Base package.json: ${JSON.stringify(BASE_PACKAGE_JSON)}
    Set the name field to: ${appName}

    .gitignore content:
    ${GITIGNORE_CONTENT}`
  },
  {
    label: 'web-app',
    prompt: `Create React + Vite web app in ./${appName}/apps/web/:

    Setup:
    - Vite + React 19 + TypeScript
    - TailwindCSS
    - TanStack Router
    - Package.json with scripts
    - Basic App.tsx with routing
    - index.html
    - vite.config.ts
    - tsconfig.json

    Keep it minimal but production-ready.`
  },
  {
    label: 'worker-app',
    prompt: `Create Cloudflare Worker in ./${appName}/apps/worker/:

    Setup:
    - Hono framework
    - TypeScript
    - wrangler.toml config
    - Package.json with scripts
    - Basic API routes (health check, cors middleware)
    - tsconfig.json

    Keep it minimal but production-ready.`
  },
  {
    label: 'backend-app',
    prompt: `Create Node.js backend in ./${appName}/apps/backend/:

    Setup:
    - Express or Hono
    - TypeScript
    - Package.json with scripts
    - Basic server setup
    - Health check endpoint
    - tsconfig.json

    Keep it minimal but production-ready.`
  },
  {
    label: 'shared-package',
    prompt: `Create shared package in ./${appName}/packages/shared/:

    Setup:
    - TypeScript
    - Package.json
    - Shared types
    - Utility functions
    - Export configuration

    Include common types used across apps.`
  }
]

await pipeline(
  scaffoldTasks,
  task => agent(task.prompt, {
    label: task.label,
    phase: 'Scaffold'
  })
)

// Configure phase
phase('Configure')
log('Configuring selected features...')

if (selectedFeatures.length > 0) {
  const featureSetup = await pipeline(
    selectedFeatures,
    feature => agent(
      `Configure ${feature} feature for ${appName}:

      Feature: ${FEATURES[feature]?.name || feature}
      Description: ${FEATURES[feature]?.description || 'Custom feature'}

      Add necessary:
      - Dependencies to relevant package.json files
      - Configuration files
      - Environment variable templates (.env.example)
      - Basic integration code
      - Setup instructions

      Keep configuration secure - no actual secrets, only templates.
      Follow Nanowork patterns from the source project.`,
      {
        label: `feature:${feature}`,
        phase: 'Configure'
      }
    )
  )
}

// Initialize phase
phase('Initialize')
log('Initializing git and installing dependencies...')

const init = await agent(
  `Initialize the ${appName} project:

  1. Change to ./${appName} directory
  2. Initialize git repository
  3. Create initial commit with message: "Initial commit - ${template.name} template with ${selectedFeatures.join(', ')}"
  4. Install dependencies (npm install or bun install)
  5. Create .env.example files in each app with required variables
  6. Verify the setup works (try running build commands)

  Return summary of what was initialized and any next steps for the user.`,
  { label: 'initialize-project', phase: 'Initialize' }
)

log('Project scaffold complete!')

return {
  project_name: appName,
  template: template.name,
  features: selectedFeatures,
  location: `./${appName}`,
  next_steps: [
    `cd ${appName}`,
    'Copy .env.example to .env files and add your keys',
    'npm run dev - Start all services',
    'npm run build - Build for production',
    'npm run deploy - Deploy to Cloudflare'
  ],
  summary: init
}
