const assert = require('assert');
const path = require('path');
const jiti = require('jiti')(path.resolve(__dirname, 'test-nlp-quick-add.js'));
const { parseQuickTask } = jiti(path.resolve(__dirname, '../libs/nlpTaskParser.ts'));

const fixedBaseDate = new Date('2026-10-31T09:00:00.000Z'); // Saturday, Oct 31, 2026
const testCategories = ['Inbox', 'Work', 'Personal', 'Side Project', 'Deep Work'];

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
  // Additional comprehensive edge case tests
  {
    name: 'Preposition with colon due: tomorrow',
    input: 'Submit quarterly report due: tomorrow',
    expected: {
      cleanTitle: 'Submit quarterly report',
      dueDate: '2026-11-01',
      priority: null,
      category: null,
      hasMatch: true,
      hasReminder: false,
    },
  },
  {
    name: 'Date enclosed in parentheses (tomorrow at 5pm)',
    input: 'Review PR (tomorrow at 5pm)',
    expected: {
      cleanTitle: 'Review PR',
      dueDate: '2026-11-01',
      priority: null,
      category: null,
      hasMatch: true,
      hasReminder: true,
    },
  },
  {
    name: 'Trailing comma before date',
    input: 'Order team lunch, tomorrow',
    expected: {
      cleanTitle: 'Order team lunch',
      dueDate: '2026-11-01',
      priority: null,
      category: null,
      hasMatch: true,
      hasReminder: false,
    },
  },
  {
    name: 'Trailing dash before date',
    input: 'Draft newsletter - tomorrow at 3pm',
    expected: {
      cleanTitle: 'Draft newsletter',
      dueDate: '2026-11-01',
      priority: null,
      category: null,
      hasMatch: true,
      hasReminder: true,
    },
  },
  {
    name: 'Time with @ symbol (@ 3pm)',
    input: 'Quick standup @ 3pm !high',
    expected: {
      cleanTitle: 'Quick standup',
      dueDate: '2026-10-31',
      priority: 'high',
      category: null,
      hasMatch: true,
      hasReminder: true,
    },
  },
  {
    name: 'Preposition until with date',
    input: 'Submit tax documents until April 15',
    expected: {
      cleanTitle: 'Submit tax documents',
      dueDate: '2027-04-15',
      priority: null,
      category: null,
      hasMatch: true,
      hasReminder: false,
    },
  },
  {
    name: 'Preposition before with date',
    input: 'Clean garage before Sunday',
    expected: {
      cleanTitle: 'Clean garage',
      dueDate: '2026-11-01',
      priority: null,
      category: null,
      hasMatch: true,
      hasReminder: false,
    },
  },
  {
    name: 'Multi-word category with hyphen matching existing category (#side-project)',
    input: 'Update roadmap #side-project !urgent',
    expected: {
      cleanTitle: 'Update roadmap',
      dueDate: null,
      priority: 'urgent',
      category: 'Side Project',
      hasMatch: true,
      hasReminder: false,
    },
  },
  {
    name: 'Multi-word category camelCase matching (#DeepWork)',
    input: 'Block focus calendar #DeepWork tomorrow',
    expected: {
      cleanTitle: 'Block focus calendar',
      dueDate: '2026-11-01',
      priority: null,
      category: 'Deep Work',
      hasMatch: true,
      hasReminder: false,
    },
  },
  {
    name: 'Multiple priority tags in single string: take highest and strip all',
    input: 'Deploy hotfix !medium !urgent to servers',
    expected: {
      cleanTitle: 'Deploy hotfix to servers',
      dueDate: null,
      priority: 'urgent',
      category: null,
      hasMatch: true,
      hasReminder: false,
    },
  },
  {
    name: 'Aliases !critical (urgent) and !important (high)',
    input: 'Renew domain cert !critical',
    expected: {
      cleanTitle: 'Renew domain cert',
      dueDate: null,
      priority: 'urgent',
      category: null,
      hasMatch: true,
      hasReminder: false,
    },
  },
  {
    name: 'Dangling preposition before stripped category tag (for #Work)',
    input: 'Prepare slide deck for #Work',
    expected: {
      cleanTitle: 'Prepare slide deck',
      dueDate: null,
      priority: null,
      category: 'Work',
      hasMatch: true,
      hasReminder: false,
    },
  },
];

let passed = 0;
let failed = 0;

console.log('--- Running NLP Task Parser Unit Tests (Direct TypeScript Execution via jiti) ---\n');

for (const tc of testCases) {
  try {
    const res = parseQuickTask(tc.input, testCategories, fixedBaseDate);
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
