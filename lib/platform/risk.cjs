// Pure defensive classification. Input is never interpreted as executable code.
function evaluateRisk(event, context = {}, settings = {}) {
  const rules = [];
  const add = (name, weight, explanation) => rules.push({ name, weight, explanation });
  if ((context.failedLogins || 0) >= 5 && event.eventType === 'FAILED_LOGIN') add('REPEATED_FAILED_LOGIN', 35, 'At least five failed logins from this source within one minute.');
  if ((context.requests || 0) >= 30) add('RAPID_REQUESTS', 30, 'At least thirty requests from this source within one minute.');
  if (/\/(?:\.env|\.git|wp-admin|wp-login|actuator|etc\/passwd|admin)/i.test(event.requestPath)) add('PATH_ENUMERATION', 40, 'The request targets a commonly enumerated sensitive path.');
  if ((context.distinctPorts || 0) >= 5) add('PORT_SCAN_PATTERN', 40, 'At least five destination ports observed within one minute.');
  if (!event.userAgent || /sqlmap|nikto|masscan|scanner|nmap/i.test(event.userAgent)) add('ABNORMAL_USER_AGENT', 25, 'Missing or recognisable scanner user-agent.');
  if ((context.deniedRequests || 0) >= 10) add('EXCESSIVE_ACCESS', 25, 'At least ten denied requests within one minute.');
  if (context.blockedIndicator) add('BLOCKED_INDICATOR', 100, 'This source matches a tenant-owned high-confidence blocked indicator.');
  if (/union\s+select|<script|\.\.\/|\$\(|;\s*(?:cat|curl|wget)\b/i.test(event.requestPath + ' ' + (event.metadata?.payload || ''))) add('SUSPICIOUS_PAYLOAD', 45, 'An inert request field matches a suspicious payload signature.');
  const multiplier = 0.5 + (settings.detectionSensitivity ?? 50) / 100;
  const score = Math.min(100, Math.round(rules.reduce((sum, rule) => sum + rule.weight, 0) * multiplier));
  const decision = score >= (settings.blockThreshold ?? 90) ? 'BLOCK' : score >= (settings.divertThreshold ?? 60) ? 'DIVERT' : score >= (settings.monitorThreshold ?? 25) ? 'MONITOR' : 'ALLOW';
  return { score, decision, matchedRules: rules, explanation: rules.length ? rules.map(r => r.explanation).join(' ') : 'No configured defensive rule matched this request.' };
}
function canManage(role) { return ['ADMIN', 'ANALYST'].includes(String(role).toUpperCase()); }
function isAdmin(role) { return String(role).toUpperCase() === 'ADMIN'; }
function csv(rows) {
  if (!rows.length) return '\ufeffNo records\r\n';
  const keys = Object.keys(rows[0]);
  const cell = value => { let s = value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value); if (/^[\s]*[=+@\-\t\r]/.test(s)) s = "'" + s; return '"' + s.replaceAll('"', '""') + '"'; };
  return '\ufeff' + [keys, ...rows.map(row => keys.map(key => row[key]))].map(row => row.map(cell).join(',')).join('\r\n');
}
module.exports = { evaluateRisk, canManage, isAdmin, csv };
