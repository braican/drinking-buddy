/**
 * Format the date consistently.
 *
 * @param {string|Date} date Date to format.
 *
 * @return string
 */
export const formatDate = (date: string | Date): string => {
  if (date === undefined) {
    return '';
  }

  try {
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
    });

    const formattedTime = dateObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

    return `${formattedDate}, ${formattedTime}`;
  } catch (e) {
    return '';
  }
};
