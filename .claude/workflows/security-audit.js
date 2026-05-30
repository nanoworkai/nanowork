export const meta = {
  name: 'security-audit',
  description: 'Pre-deployment security audit - finds vulnerabilities, excludes .env files',
  whenToUse: 'Run before shipping to production, after major changes, or on-demand for security review',
  phases: [
    { title: 'Discover', detail: 'Find source files, exclude sensitive files' },
    { title: 'Scan', detail: 'Parallel security scans across dimensions' },
    { title: 'Verify', detail: 'Adversarial validation of findings' },
    { title: 'Report', detail: 'Synthesize actionable security report' }
  ]
}

const EXCLUDE_PATTERNS = [
  '.env',
  '.env.*',
  'node_modules',
  '.git',
  '.wrangler',
  'dist',
  'build',
  '.next',
  'coverage',
  '*.lock',
  'package-lock.json',
  'bun.lockb',
  'yarn.lock'
]

const SECURITY_DIMENSIONS = [
  {
    key: 'auth',
    prompt: `Scan for authentication and authorization vulnerabilities:
- Hardcoded credentials or API keys in code
- Insecure authentication flows
- Missing authorization checks
- JWT/session handling issues
- Broken access control

Focus on source code in apps/ and packages/ directories.
Exclude: ${EXCLUDE_PATTERNS.join(', ')}

Return findings with file path, line number, severity (critical/high/medium/low), description, and remediation.`
  },
  {
    key: 'injection',
    prompt: `Scan for injection vulnerabilities:
- SQL injection vectors
- XSS vulnerabilities
- Command injection risks
- Path traversal vulnerabilities
- NoSQL injection
- Template injection

Focus on user input handling, database queries, shell commands.
Exclude: ${EXCLUDE_PATTERNS.join(', ')}

Return findings with file path, line number, severity, description, and remediation.`
  },
  {
    key: 'data',
    prompt: `Scan for data protection issues:
- Sensitive data exposure (PII, credentials)
- Missing encryption for sensitive data
- Insecure data storage
- Logging sensitive information
- Insecure transmission

Focus on data handling, API responses, logging.
Exclude: ${EXCLUDE_PATTERNS.join(', ')}

Return findings with file path, line number, severity, description, and remediation.`
  },
  {
    key: 'api',
    prompt: `Scan for API security issues:
- CORS misconfigurations
- Missing rate limiting
- Exposed debug/admin endpoints
- API key exposure in client code
- Missing input validation
- Insecure HTTP methods

Focus on API routes, middleware, HTTP handlers.
Exclude: ${EXCLUDE_PATTERNS.join(', ')}

Return findings with file path, line number, severity, description, and remediation.`
  },
  {
    key: 'dependencies',
    prompt: `Scan for dependency security issues:
- Known vulnerable packages (check package.json files)
- Outdated critical dependencies
- Unused dependencies that increase attack surface
- Missing security updates

Check package.json files in apps/ and packages/ directories.

Return findings with package name, current version, vulnerability, severity, and fix.`
  },
  {
    key: 'config',
    prompt: `Scan for configuration security issues:
- Debug mode enabled in production
- Insecure defaults
- Missing security headers
- Exposed internal paths/URLs
- Weak crypto algorithms
- Insecure cookie settings

Focus on configuration files, middleware, server setup.
Exclude: ${EXCLUDE_PATTERNS.join(', ')}

Return findings with file path, line number, severity, description, and remediation.`
  }
]

const FINDING_SCHEMA = {
  type: 'object',
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          file: { type: 'string' },
          line: { type: 'number' },
          severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
          category: { type: 'string' },
          description: { type: 'string' },
          remediation: { type: 'string' },
          code_snippet: { type: 'string' }
        },
        required: ['severity', 'category', 'description', 'remediation']
      }
    }
  },
  required: ['findings']
}

const VERIFY_SCHEMA = {
  type: 'object',
  properties: {
    is_real: { type: 'boolean' },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    reasoning: { type: 'string' },
    false_positive_reason: { type: 'string' }
  },
  required: ['is_real', 'confidence', 'reasoning']
}

// Discover phase
phase('Discover')
log('Scanning for source files and building audit scope...')

const scope = args?.scope || 'full'
const minSeverity = args?.severity || 'medium'

let fileList
if (scope === 'changed') {
  fileList = await agent(
    'List all files changed in the current branch compared to main. Return absolute paths.',
    { label: 'find-changed-files' }
  )
} else {
  fileList = await agent(
    `List all source files in apps/ and packages/ directories to audit.

    EXCLUDE these patterns: ${EXCLUDE_PATTERNS.join(', ')}
    INCLUDE: .ts, .tsx, .js, .jsx files and package.json files

    Return as a simple list of file paths, one per line.`,
    { label: 'find-source-files' }
  )
}

const fileCount = fileList ? fileList.split('\n').filter(f => f.trim()).length : 0
log(`Found ${fileCount} files to audit`)

// Scan phase
phase('Scan')
log(`Running ${SECURITY_DIMENSIONS.length} parallel security scans...`)

const scanResults = await parallel(
  SECURITY_DIMENSIONS.map(dim => () =>
    agent(dim.prompt, {
      label: `scan:${dim.key}`,
      phase: 'Scan',
      schema: FINDING_SCHEMA
    })
  )
)

const allFindings = scanResults
  .filter(Boolean)
  .flatMap((result, idx) =>
    result.findings.map(f => ({
      ...f,
      dimension: SECURITY_DIMENSIONS[idx].key
    }))
  )

log(`Found ${allFindings.length} potential security issues`)

// Verify phase - adversarial validation
phase('Verify')
log('Adversarially verifying findings to eliminate false positives...')

const verified = await pipeline(
  allFindings,
  finding => agent(
    `Adversarially verify this security finding. Try to REFUTE it - look for reasons it's a false positive.

Finding: ${finding.description}
File: ${finding.file || 'N/A'}
Line: ${finding.line || 'N/A'}
Severity: ${finding.severity}
Category: ${finding.category}
Code: ${finding.code_snippet || 'N/A'}

Is this a real vulnerability or a false positive? Be skeptical.`,
    {
      label: `verify:${finding.category}`,
      phase: 'Verify',
      schema: VERIFY_SCHEMA
    }
  ),
  (verification, finding) => ({
    ...finding,
    verified: verification?.is_real || false,
    confidence: verification?.confidence || 'low',
    verification_reasoning: verification?.reasoning || '',
    false_positive_reason: verification?.false_positive_reason || ''
  })
)

const confirmedFindings = verified
  .filter(Boolean)
  .filter(f => f.verified && f.confidence !== 'low')

// Apply severity filter
const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
const minSeverityLevel = severityOrder[minSeverity] || 2

const filteredFindings = confirmedFindings.filter(
  f => severityOrder[f.severity] >= minSeverityLevel
)

log(`${filteredFindings.length} verified findings after validation (${confirmedFindings.length - filteredFindings.length} filtered by severity)`)

// Report phase
phase('Report')

const report = {
  summary: {
    total_files_scanned: fileCount,
    total_findings: allFindings.length,
    verified_findings: confirmedFindings.length,
    reported_findings: filteredFindings.length,
    by_severity: {
      critical: filteredFindings.filter(f => f.severity === 'critical').length,
      high: filteredFindings.filter(f => f.severity === 'high').length,
      medium: filteredFindings.filter(f => f.severity === 'medium').length,
      low: filteredFindings.filter(f => f.severity === 'low').length
    },
    by_category: SECURITY_DIMENSIONS.reduce((acc, dim) => {
      acc[dim.key] = filteredFindings.filter(f => f.dimension === dim.key).length
      return acc
    }, {})
  },
  findings: filteredFindings.sort((a, b) =>
    severityOrder[b.severity] - severityOrder[a.severity]
  ),
  scan_config: {
    scope,
    min_severity: minSeverity,
    excluded_patterns: EXCLUDE_PATTERNS
  }
}

return report
