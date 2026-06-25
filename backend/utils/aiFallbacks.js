// Rule-based AI fallbacks when Gemini is unavailable

const CATEGORY_RULES = [
  { keywords: ['bug', 'fix', 'api', 'code', 'deploy', 'database', 'auth', 'login', 'backend', 'frontend', 'dev', 'implement', 'build'], category: 'Development' },
  { keywords: ['design', 'ui', 'ux', 'mockup', 'wireframe', 'figma', 'dashboard', 'layout'], category: 'Design' },
  { keywords: ['marketing', 'campaign', 'social', 'seo', 'content', 'blog', 'ads'], category: 'Marketing' },
  { keywords: ['interview', 'hire', 'hr', 'onboard', 'recruit', 'employee'], category: 'HR' },
  { keywords: ['test', 'qa', 'quality', 'review'], category: 'QA' },
  { keywords: ['meeting', 'plan', 'research', 'document', 'write'], category: 'Planning' },
];

const EFFORT_PATTERNS = [
  { keywords: ['epic', 'platform', 'system', 'architecture', 'migration', 'rewrite'], effort: 'Epic (1+ week)', days: 14 },
  { keywords: ['integrate', 'build', 'create', 'implement', 'develop', 'website', 'application'], effort: 'Large (2-3 days)', days: 3 },
  { keywords: ['update', 'refactor', 'improve', 'enhance', 'add'], effort: 'Medium (1 day)', days: 1 },
  { keywords: ['fix', 'bug', 'typo', 'small', 'quick', 'patch'], effort: 'Small (1-2 hours)', days: 0.25 },
];

function categorizeLocally(title, description = '') {
  const text = `${title} ${description}`.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((kw) => text.includes(kw))) {
      return [rule.category];
    }
  }
  return ['General'];
}

function estimateLocally(title, description = '', priority = 'medium') {
  const text = `${title} ${description}`.toLowerCase();
  let match = EFFORT_PATTERNS.find((p) => p.keywords.some((kw) => text.includes(kw)));
  if (!match) match = EFFORT_PATTERNS[2]; // default Medium

  const dueDate = new Date();
  let offset = match.days;
  if (priority === 'high') offset = Math.max(0.5, offset * 0.5);
  if (priority === 'low') offset = offset * 1.5;
  dueDate.setDate(dueDate.getDate() + Math.ceil(offset));

  return {
    effort: match.effort,
    suggestedDueDate: dueDate.toISOString().split('T')[0],
    reason: `Estimated as ${match.effort.toLowerCase()} based on task scope${priority === 'high' ? ' with high priority urgency' : ''}.`,
  };
}

function suggestSubtasksLocally(title, description = '') {
  const text = `${title} ${description}`.toLowerCase();
  const subtasks = [];

  if (text.includes('auth') || text.includes('login')) {
    return ['Design database schema', 'Create login API', 'Create signup API', 'Add JWT authentication', 'Write tests'];
  }
  if (text.includes('e-commerce') || text.includes('ecommerce') || text.includes('website')) {
    return ['Setup project', 'Design database', 'Create authentication', 'Build product APIs', 'Create cart system', 'Payment integration', 'Testing', 'Deployment'];
  }
  if (text.includes('dashboard')) {
    return ['Define metrics', 'Design layout', 'Build data API', 'Implement charts', 'Add filters', 'Testing'];
  }

  // Make it dynamic based on the task title if no specific keywords match
  const shortTitle = title.length > 30 ? title.substring(0, 27) + '...' : title;
  
  subtasks.push(`Outline requirements for: ${shortTitle}`);
  subtasks.push(`Initial implementation of ${shortTitle}`);
  subtasks.push(`Review and test ${shortTitle}`);
  if (text.includes('deploy') || text.includes('launch') || text.includes('publish')) {
    subtasks.push('Final deployment and launch');
  }
  return subtasks;
}

function parseLocally(text) {
  const lower = text.toLowerCase();
  let priority = 'medium';
  if (lower.includes('high priority') || lower.includes('urgent') || lower.includes('asap')) priority = 'high';
  if (lower.includes('low priority')) priority = 'low';

  let dueDate = null;
  const daysMatch = lower.match(/(\d+)\s*days?/);
  if (daysMatch) {
    const d = new Date();
    d.setDate(d.getDate() + parseInt(daysMatch[1], 10));
    dueDate = d.toISOString().split('T')[0];
  }

  const title = text
    .replace(/with (high|low|medium) priority/gi, '')
    .replace(/in the next \d+ days?/gi, '')
    .replace(/remind me to/gi, '')
    .replace(/please/gi, '')
    .trim();

  return { title: title || text, dueDate, priority };
}

function parseAiJson(textResponse) {
  let text = textResponse?.trim?.() || '';
  if (text.startsWith('```json')) text = text.replace(/```json\n?/g, '').replace(/```/g, '');
  else if (text.startsWith('```')) text = text.replace(/```\n?/g, '').replace(/```/g, '');
  return JSON.parse(text.trim());
}

module.exports = {
  categorizeLocally,
  estimateLocally,
  suggestSubtasksLocally,
  parseLocally,
  parseAiJson,
};
