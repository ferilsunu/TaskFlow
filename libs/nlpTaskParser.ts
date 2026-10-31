import * as chrono from 'chrono-node';
import { format } from 'date-fns';
import { Priority } from '@/types/todo';

export interface ParsedTaskResult {
  originalInput: string;
  cleanTitle: string;
  dueDate: string | null;       // YYYY-MM-DD
  reminderAt: string | null;    // ISO string if explicit time was specified
  priority: Priority | null;
  category: string | null;
  hasMatch: boolean;
  extractedTags: {
    dateText?: string;
    priorityText?: string;
    categoryText?: string;
  };
}

/**
 * Parses natural language input for task creation:
 * - Dates / times: e.g. "tomorrow at 5pm", "next monday", "friday at 10am", "in 2 hours", "today"
 * - Priority tags: e.g. "!urgent", "!critical", "!high", "!important", "!medium", "!low", "!p1"–"!p4", "!1"–"!4"
 * - Category tags: e.g. "#Work", "#Personal", "#side-project", "#DeepWork"
 */
export function parseQuickTask(
  input: string,
  availableCategories: string[] = ['Inbox', 'Work', 'Personal'],
  baseDate: Date = new Date()
): ParsedTaskResult {
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
  let priority: Priority | null = null;
  let priorityText: string | undefined;
  let category: string | null = null;
  let categoryText: string | undefined;
  let dateText: string | undefined;
  let dueDate: string | null = null;
  let reminderAt: string | null = null;

  // 1. Priority mapping and rank: urgent (4) > high (3) > medium (2) > low (1)
  const priorityRank: Record<Priority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
  const prioRegex = /(?:^|\s)!(urgent|critical|high|important|medium|med|low|p[1-4]|[1-4])[,;.]?(?=\s|$)/gi;

  const prioMatches: RegExpExecArray[] = [];
  let prioMatch: RegExpExecArray | null;
  while ((prioMatch = prioRegex.exec(text)) !== null) {
    prioMatches.push(prioMatch);
  }

  if (prioMatches.length > 0) {
    let highestRank = 0;
    for (const match of prioMatches) {
      const val = match[1].toLowerCase();
      let p: Priority | null = null;
      if (val === 'urgent' || val === 'critical' || val === 'p1' || val === '1') p = 'urgent';
      else if (val === 'high' || val === 'important' || val === 'p2' || val === '2') p = 'high';
      else if (val === 'medium' || val === 'med' || val === 'p3' || val === '3') p = 'medium';
      else if (val === 'low' || val === 'p4' || val === '4') p = 'low';

      if (p && priorityRank[p] > highestRank) {
        highestRank = priorityRank[p];
        priority = p;
        priorityText = match[0].trim().replace(/[,;.]$/, '');
      }
    }
    // Strip all priority tags
    text = text.replace(prioRegex, ' ');
  }

  // 2. Category match: #TagName with preposition cleanup and normalized matching
  const catRegex = /(?:^|\s)(?:(for|in|under|to)\s+)?#([a-zA-Z][a-zA-Z0-9_-]*)[,;.]?(?=\s|$)/i;
  const catMatch = text.match(catRegex);
  if (catMatch) {
    const rawMatch = catMatch[0].trim();
    categoryText = (rawMatch.startsWith('#') ? rawMatch : rawMatch.slice(rawMatch.indexOf('#'))).replace(/[,;.]$/, '');
    const rawName = catMatch[2];

    // Exact or normalized match against availableCategories (supports hyphenated & camelCase matching)
    const normalize = (s: string) => s.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const existing = availableCategories.find(
      (c) => normalize(c) === normalize(rawName)
    );
    category = existing || rawName;

    text = text.replace(catMatch[0], ' ');
  }

  // 3. Date / Time match using chrono-node
  // Use forwardDate: true so day names (e.g. "Friday") resolve to the upcoming occurrence
  const rawChronoResults = chrono.parse(text, baseDate, { forwardDate: true });
  // Filter out duration phrases like "for 30 minutes", "for 2 hours"
  const chronoResults = rawChronoResults.filter(
    (r) => !/^for\s+\d+\s*(m|min|minute|h|hour|sec|second|d|day)s?/i.test(r.text.trim())
  );

  if (chronoResults.length > 0) {
    // Sort descending by index for safe right-to-left string slicing
    const sorted = [...chronoResults].sort((a, b) => b.index - a.index);

    let combinedDate: Date | null = null;
    let hasCertainHour = false;
    const dateTexts: string[] = [];

    // Chrono results in chronological appearance in string
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

    // Strip date parts and any immediate preceding prepositions or enclosing brackets
    for (const r of sorted) {
      let before = text.slice(0, r.index);
      let after = text.slice(r.index + r.text.length);

      // Check if enclosed in parentheses: ( ... )
      if (before.trimEnd().endsWith('(') && after.trimStart().startsWith(')')) {
        before = before.slice(0, before.lastIndexOf('('));
        after = after.slice(after.indexOf(')') + 1);
      }

      // Check for preceding prepositions or punctuation: by, due:, due, until, before, on, for, at, around, @, -, :
      const prepMatch = before.match(/(?:^|\s)(by|due:?|until|before|on|for|at|around|@|[-:,])\s*$/i);
      if (prepMatch) {
        before = before.slice(0, before.length - prepMatch[0].length);
      }
      text = before + ' ' + after;
    }
  }

  // 4. Clean title
  let cleanTitle = text.replace(/\s+/g, ' ').trim();
  cleanTitle = cleanTitle.replace(/[,;:\-–—]+$/, '').trim();
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
