// Security Audit Command Handler
// Usage: /security-audit [--scope full|changed|critical] [--severity low|medium|high|critical]

export async function handler({ args, workflow, respond }) {
  const scope = args?.scope || 'full'
  const severity = args?.severity || 'medium'

  respond(`🔒 Running security audit (scope: ${scope}, min severity: ${severity})...`)

  try {
    const result = await workflow('security-audit', { scope, severity })

    const summary = result.summary
    const critical = result.findings.filter(f => f.severity === 'critical')
    const high = result.findings.filter(f => f.severity === 'high')
    const medium = result.findings.filter(f => f.severity === 'medium')

    if (critical.length > 0) {
      respond(`\n🚨 CRITICAL: ${critical.length} critical security issues found\n`)
      critical.forEach(f => {
        respond(`${f.file || 'Unknown'}:${f.line || '?'}`)
        respond(`  ${f.description}`)
        respond(`  ➜ ${f.remediation}\n`)
      })
    }

    if (high.length > 0) {
      respond(`⚠️  HIGH: ${high.length} high-severity issues found\n`)
      high.forEach(f => {
        respond(`${f.file || 'Unknown'}:${f.line || '?'} - ${f.description}`)
      })
    }

    if (medium.length > 0 && severity === 'medium') {
      respond(`\n⚡ MEDIUM: ${medium.length} medium-severity issues found`)
    }

    respond(`\n✅ Security audit complete`)
    respond(`   Scanned: ${summary.total_files_scanned} files`)
    respond(`   Verified: ${summary.verified_findings} issues`)
    respond(`   Reported: ${summary.reported_findings} issues`)
    respond(`\n   By severity:`)
    respond(`     • Critical: ${summary.by_severity.critical}`)
    respond(`     • High: ${summary.by_severity.high}`)
    respond(`     • Medium: ${summary.by_severity.medium}`)
    respond(`     • Low: ${summary.by_severity.low}`)

    if (critical.length === 0 && high.length === 0) {
      respond(`\n✨ No critical or high-severity issues found. Ready to ship!`)
    } else {
      respond(`\n⚠️  Fix ${critical.length + high.length} critical/high issues before deploying`)
    }

  } catch (error) {
    respond(`❌ Security audit failed: ${error.message}`)
    throw error
  }
}

export const meta = {
  name: 'security-audit',
  description: 'Pre-deployment security audit - finds vulnerabilities, excludes .env files',
  usage: '/security-audit [--scope full|changed|critical] [--severity low|medium|high|critical]',
  examples: [
    '/security-audit',
    '/security-audit --scope changed',
    '/security-audit --severity critical'
  ]
}
