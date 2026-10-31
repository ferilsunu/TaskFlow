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
 * - Priority tags: e.g. "!urgent", "!high", "!medium", "!low", "!p1", "!p2", "!p3", "!p4", "!1", "!2", "!3", "!4"
 * - Category tags: e.g. "#Work", "#Personal", "#shopping"
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

  // 1. Priority match: !urgent, !high, !medium, !med, !low, !p1..p4, !1..4
  // Allows optional trailing comma/semicolon/period before space or end
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

    // Remove the priority tag from text
    text = text.replace(prioMatch[0], ' ');
  }

  // 2. Category match: #TagName (must begin with a letter so issue numbers like #123 aren't tagged)
  // Allows optional trailing comma/semicolon/period before space or end
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

    // Remove the category tag from text
    text = text.replace(catMatch[0], ' ');
  }

  // 3. Date / Time match using chrono-node
  // Use forwardDate: true so day names (e.g. "Friday") resolve to the upcoming occurrence
  const rawChronoResults = chrono.parse(text, baseDate, { forwardDate: true });
  // Filter out duration phrases like "for 30 minutes", "for 2 hours" which are task descriptions, not schedule times
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

    // Strip date parts and any immediate preceding prepositions (by, due, on, for, at, around)
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

  // 4. Clean title
  let cleanTitle = text.replace(/\s+/g, ' ').trim();
  // If stripping left nothing (e.g. user literally typed "!urgent" or "tomorrow"), fallback to input
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
