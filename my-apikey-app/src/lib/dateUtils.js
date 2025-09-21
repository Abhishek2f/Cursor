/**
 * Utility functions for date formatting and manipulation
 */

/**
 * Formats a date string to a localized string
 * @param {string|null|undefined} dateString - The date string to format
 * @returns {string} - Formatted date string or 'Never' if no date
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'Never';
  return new Date(dateString).toLocaleString();
};

/**
 * Formats a date for display in a more readable format
 * @param {string} dateString - The date string to format
 * @returns {string} - Formatted date string
 */
export const formatDateReadable = (dateString) => {
  if (!dateString) return 'Never';

  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return 'Today';
  } else if (diffDays === 2) {
    return 'Yesterday';
  } else if (diffDays <= 7) {
    return `${diffDays - 1} days ago`;
  } else {
    return date.toLocaleDateString();
  }
};

/**
 * Checks if a date is within the last N days
 * @param {string} dateString - The date string to check
 * @param {number} days - Number of days to check against
 * @returns {boolean} - True if date is within the last N days
 */
export const isWithinLastDays = (dateString, days) => {
  if (!dateString) return false;

  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now - date;
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  return diffDays <= days;
};
