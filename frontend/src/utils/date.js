import { parseISO } from 'date-fns';

/**
 * Safely parses a date string, treating typical SQLite datetime strings 
 * (which are in UTC but lacking the timezone designator, e.g. "YYYY-MM-DD HH:MM:SS")
 * as UTC so that they are correctly converted to local browser time.
 */
export const parseOrderDate = (dateStr) => {
  if (!dateStr) return new Date();
  
  if (dateStr instanceof Date) return dateStr;

  const str = String(dateStr).trim();

  // If it already has Z, + offset, or a timezone offset suffix
  if (str.includes('Z') || str.includes('+') || (str.includes('-') && str.split('T')[1]?.includes('-'))) {
    return parseISO(str);
  }

  // For SQLite CURRENT_TIMESTAMP strings (e.g. "2026-06-04 13:41:00")
  let formatted = str;
  if (formatted.includes(' ')) {
    formatted = formatted.replace(' ', 'T');
  }
  if (!formatted.endsWith('Z')) {
    formatted += 'Z';
  }
  
  return parseISO(formatted);
};
