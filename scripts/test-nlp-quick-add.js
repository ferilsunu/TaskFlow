const assert = require('assert');
const chrono = require('chrono-node');
const { format } = require('date-fns');

function parseQuickTask(
  input,
  availableCategories = ['Inbox', 'Work', 'Personal'],
  baseDate = new Date('2026-10-31T09:00:00.000Z')
) {
  if (!input || !input.trim()) {
    return {
      originalInput: input || '',
      cleanTitle: '',
      dueDate: null,
      reminderAt: null,
      priority: null,
      category: null,
      hasMatch: false,
      extractedTags: {},
    };
  }

  let text = input;
  let priority = null;
  let priorityText;
  let category = null;
  let categoryText;
  let dateText;
  let dueDate = null;
  let reminderAt = null;

  // 1. Priority match
  const prioRegex = /(?:^|\s)!(urgent|high|medium|med|low|p[1-4]|[1-4])[,;.]?(?=\s|$)/i;
  const prioMatch = text.match(prioRegex);
  if (prioMatch) {
    const rawMatch = prioMatch[0].trim();
    priorityText = rawMatch.replace(/[,;.]$/, '');
    const val = prioMatch[1].toLowerCase();
    if (val === 'urgent' || val === 'p1' || val === '1') priority = 'urgent';
    else if (val === 'high' || val === 'p2' || val === '2') priority = 'high';
    else if (val === 'medium' || val === 'med' || val === 'p3' || val === '3') priority = 'medium';
    else if (val === 'low' || val === 'p4' || val === '4') priority = 'low';

    text = text.replace(prioMatch[0], ' ');
  }

  // 2. Category match
  const catRegex = /(?:^|\s)#([a-zA-Z][a-zA-Z0-9_-]*)[,;.]?(?=\s|$)/i;
  const catMatch = text.match(catRegex);
  if (catMatch) {
    const rawMatch = catMatch[0].trim();
    categoryText = rawMatch.replace(/[,;.]$/, '');
    const rawName = catMatch[1];
    const existing = availableCategories.find(
      (c) => c.toLowerCase() === rawName.toLowerCase()
    );
    category = existing || rawName;

    text = text.replace(catMatch[0], ' ');
  }

  // 3. Date / Time match using chrono-node
  const rawChronoResults = chrono.parse(text, baseDate, { forwardDate: true });
  const chronoResults = rawChronoResults.filter(
    (r) => !/^for\s+\d+\s*(m|min|minute|h|hour|sec|second|d|day)s?/i.test(r.text.trim())
  );

  if (chronoResults.length > 0) {
    const sorted = [...chronoResults].sort((a, b) => b.index - a.index);

    let combinedDate = null;
    let hasCertainHour = false;
    const dateTexts = [];

    for (const res of chronoResults) {
      dateTexts.push(res.text.trim());
      const d = res.start.date();
      if (!combinedDate) {
        combinedDate = new Date(d);
      } else {
        if (res.start.isCertain('hour')) {
          combinedDate.setHours(d.getHours(), d.getMinutes(), d.getSeconds(), 0);
        }
        if (res.start.isCertain('day') && !hasCertainHour) {
          combinedDate.setFullYear(d.getFullYear(), d.getMonth(), d.getDate());
        }
      }
      if (res.start.isCertain('hour')) {
        hasCertainHour = true;
      }
    }

    if (combinedDate) {
      dueDate = format(combinedDate, 'yyyy-MM-dd');
      if (hasCertainHour) {
        reminderAt = combinedDate.toISOString();
      }
      dateText = dateTexts.join(' ');
    }

    for (const r of sorted) {
      let before = text.slice(0, r.index);
      let after = text.slice(r.index + r.text.length);
      const prepMatch = before.match(/(?:^|\s)(by|due|on|for|at|around)\s+$/i);
      if (prepMatch) {
        before = before.slice(0, before.length - prepMatch[0].length);
      }
      text = before + ' ' + after;
    }
  }

  let cleanTitle = text.replace(/\s+/g, ' ').trim();
  if (!cleanTitle) {
    cleanTitle = input.trim();
  }

  const hasMatch = Boolean(priority || category || dueDate);

  return {
    originalInput: input,
    cleanTitle,
    dueDate,
    reminderAt,
    priority,
    category,
    hasMatch,
    extractedTags: {
      dateText,
      priorityText,
      categoryText,
    },
  };
}

const fixedBaseDate = new Date('2026-10-31T09:00:00.000Z'); // Saturday, Oct 31, 2026

const testCases = [
  {
    name: 'Full quick add string with date, time, priority, and category',
    input: 'Finish quarterly review tomorrow at 5pm !urgent #Work',
    expected: {
      cleanTitle: 'Finish quarterly review',
      dueDate: '2026-11-01',
      priority: 'urgent',
      category: 'Work',
      hasMatch: true,
      hasReminder: true,
    },
  },
  {
    name: 'Priority shorthand !p1 and category',
    input: 'Prepare budget slides !p1 #Work',
    expected: {
      cleanTitle: 'Prepare budget slides',
      dueDate: null,
      priority: 'urgent',
      category: 'Work',
      hasMatch: true,
      hasReminder: false,
    },
  },
  {
    name: 'Priority !high and relative date on Friday',
    input: 'Dentist appointment on Friday at 10am !high',
    expected: {
      cleanTitle: 'Dentist appointment',
      dueDate: '2026-11-06',
      priority: 'high',
      category: null,
      hasMatch: true,
      hasReminder: true,
    },
  },
  {
    name: 'Case insensitive category matching',
    input: 'Buy groceries today #personal',
    expected: {
      cleanTitle: 'Buy groceries',
      dueDate: '2026-10-31',
      priority: null,
      category: 'Personal',
      hasMatch: true,
      hasReminder: false,
    },
  },
  {
    name: 'New custom category not in default list',
    input: 'Refactor auth controller #Backend !urgent',
    expected: {
      cleanTitle: 'Refactor auth controller',
      dueDate: null,
      priority: 'urgent',
      category: 'Backend',
      hasMatch: true,
      hasReminder: false,
    },
  },
  {
    name: 'Relative hours phrase (in 2 hours)',
    input: 'Sync with design team in 2 hours !medium',
    expected: {
      cleanTitle: 'Sync with design team',
      dueDate: '2026-10-31',
      priority: 'medium',
      category: null,
      hasMatch: true,
      hasReminder: true,
    },
  },
  {
    name: 'Preposition by with date (by Dec 25)',
    input: 'Send Christmas gifts by Dec 25',
    expected: {
      cleanTitle: 'Send Christmas gifts',
      dueDate: '2026-12-25',
      priority: null,
      category: null,
      hasMatch: true,
      hasReminder: false,
    },
  },
  {
    name: 'Clean task without any natural language tags (duration phrase ignored)',
    input: 'Read a book for 30 minutes',
    expected: {
      cleanTitle: 'Read a book for 30 minutes',
      dueDate: null,
      priority: null,
      category: null,
      hasMatch: false,
      hasReminder: false,
    },
  },
  {
    name: 'Input with exclamation marks that are NOT priority tags',
    input: 'Congratulations on the new job! #Personal',
    expected: {
      cleanTitle: 'Congratulations on the new job!',
      dueDate: null,
      priority: null,
      category: 'Personal',
      hasMatch: true,
      hasReminder: false,
    },
  },
  {
    name: 'Input with issue numbers that are NOT category tags',
    input: 'Fix github issue #123 tomorrow',
    expected: {
      cleanTitle: 'Fix github issue #123',
      dueDate: '2026-11-01',
      priority: null,
      category: null,
      hasMatch: true,
      hasReminder: false,
    },
  },
  {
    name: 'Tags only with no extra title text (fallback safety)',
    input: '!urgent',
    expected: {
      cleanTitle: '!urgent',
      dueDate: null,
      priority: 'urgent',
      category: null,
      hasMatch: true,
      hasReminder: false,
    },
  },
  {
    name: 'Comma after priority tag',
    input: 'Deploy updates !urgent, #Work, tomorrow at 9am',
    expected: {
      cleanTitle: 'Deploy updates',
      dueDate: '2026-11-01',
      priority: 'urgent',
      category: 'Work',
      hasMatch: true,
      hasReminder: true,
    },
  },
  {
    name: 'URL with hash fragment should not trigger category match',
    input: 'Check documentation at https://example.com/#overview tomorrow',
    expected: {
      cleanTitle: 'Check documentation at https://example.com/#overview',
      dueDate: '2026-11-01',
      priority: null,
      category: null,
      hasMatch: true,
      hasReminder: false,
    },
  },
  {
    name: 'Priority shorthand !2 (high) and !4 (low)',
    input: 'Low priority backlog cleanup !4',
    expected: {
      cleanTitle: 'Low priority backlog cleanup',
      dueDate: null,
      priority: 'low',
      category: null,
      hasMatch: true,
      hasReminder: false,
    },
  },
];

let passed = 0;
let failed = 0;

console.log('--- Running NLP Task Parser Unit Tests ---\n');

for (const tc of testCases) {
  try {
    const res = parseQuickTask(tc.input, ['Inbox', 'Work', 'Personal'], fixedBaseDate);
    assert.strictEqual(res.cleanTitle, tc.expected.cleanTitle, `cleanTitle mismatch for: "${tc.input}"`);
    assert.strictEqual(res.dueDate, tc.expected.dueDate, `dueDate mismatch for: "${tc.input}"`);
    assert.strictEqual(res.priority, tc.expected.priority, `priority mismatch for: "${tc.input}"`);
    assert.strictEqual(res.category, tc.expected.category, `category mismatch for: "${tc.input}"`);
    assert.strictEqual(res.hasMatch, tc.expected.hasMatch, `hasMatch mismatch for: "${tc.input}"`);
    assert.strictEqual(Boolean(res.reminderAt), tc.expected.hasReminder, `hasReminder mismatch for: "${tc.input}"`);

    console.log(`✓ [PASS] ${tc.name}`);
    passed++;
  } catch (err) {
    console.error(`✗ [FAIL] ${tc.name}:`, err.message);
    failed++;
  }
}

console.log(`\nResults: ${passed} passed, ${failed} failed.`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('All tests passed successfully!');
  process.exit(0);
}
