/**
 * Date Utility Functions
 * 
 * Provides consistent date formatting and comparison utilities
 * across the entire Mediqzy app.
 * 
 * Key Features:
 * - Calendar day comparison (not 24-hour periods)
 * - Timezone-aware operations
 * - Proper Today/Yesterday detection
 * - Midnight edge case handling
 */

/**
 * Normalizes a date to midnight (00:00:00.000) in local timezone
 * This ensures we compare calendar days, not 24-hour periods
 * 
 * @param {Date|string|number} date - Date to normalize
 * @returns {Date} - Date set to midnight
 */
export const normalizeToMidnight = (date) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
};

/**
 * Calculates the difference in calendar days between two dates
 * 
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date  
 * @returns {number} - Difference in days (positive if date1 > date2)
 */
export const getDaysDifference = (date1, date2) => {
    const d1 = normalizeToMidnight(new Date(date1));
    const d2 = normalizeToMidnight(new Date(date2));

    const diffTime = d1.getTime() - d2.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Checks if a date is today
 * 
 * @param {Date|string} date - Date to check
 * @returns {boolean}
 */
export const isToday = (date) => {
    return getDaysDifference(new Date(), date) === 0;
};

/**
 * Checks if a date is yesterday
 * 
 * @param {Date|string} date - Date to check
 * @returns {boolean}
 */
export const isYesterday = (date) => {
    return getDaysDifference(new Date(), date) === 1;
};

/**
 * Formats a date string into a user-friendly label
 * 
 * Rules:
 * - Today's orders → "Today"
 * - Yesterday's orders → "Yesterday"  
 * - This year's orders → "24 Jan"
 * - Older orders → "24 Jan 2025"
 * 
 * @param {Date|string} dateInput - Date to format
 * @param {Object} options - Formatting options
 * @param {boolean} options.includeTime - Include time in the label
 * @param {string} options.fallback - Fallback text for invalid dates
 * @returns {string} - Formatted date label
 */
export const formatDateLabel = (dateInput, options = {}) => {
    const { fallback = 'Recent', includeTime = false } = options;

    if (!dateInput) return fallback;

    const orderDate = new Date(dateInput);

    // Check if date is valid
    if (isNaN(orderDate.getTime())) return fallback;

    const now = new Date();

    // Calculate difference in calendar days
    const diffDays = getDaysDifference(now, orderDate);

    let dateLabel;

    if (diffDays === 0) {
        dateLabel = 'Today';
    } else if (diffDays === 1) {
        dateLabel = 'Yesterday';
    } else {
        // For orders older than yesterday
        const isCurrentYear = orderDate.getFullYear() === now.getFullYear();

        if (isCurrentYear) {
            // Same year: "24 Jan"
            dateLabel = orderDate.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short'
            });
        } else {
            // Different year: "24 Jan 2025"
            dateLabel = orderDate.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        }
    }

    // Optionally add time
    if (includeTime) {
        const timeStr = orderDate.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        return `${dateLabel}, ${timeStr}`;
    }

    return dateLabel;
};

/**
 * Formats a date for display in order cards
 * Shows relative text for recent orders, full date for older ones
 * 
 * @param {Date|string} dateInput - Date to format
 * @returns {string} - Formatted date string
 */
export const formatOrderDate = (dateInput) => {
    return formatDateLabel(dateInput);
};

/**
 * Formats a timestamp for display in chat/messaging
 * Shows time for today, day name for this week, full date for older
 * 
 * @param {Date|string} dateInput - Date to format
 * @returns {string} - Formatted timestamp
 */
export const formatMessageTime = (dateInput) => {
    if (!dateInput) return '';

    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '';

    const now = new Date();
    const diffDays = getDaysDifference(now, date);

    if (diffDays === 0) {
        // Today: show time only
        return date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        // This week: show day name
        return date.toLocaleDateString('en-IN', { weekday: 'short' });
    } else {
        // Older: show date
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short'
        });
    }
};

/**
 * Groups items by date label for section lists
 * 
 * @param {Array} items - Array of items with date field
 * @param {string} dateField - Name of the date field (default: 'createdAt')
 * @returns {Object} - Object with date labels as keys and arrays of items as values
 */
export const groupByDateLabel = (items, dateField = 'createdAt') => {
    if (!items || !Array.isArray(items)) return {};

    // First pass: group items and track metadata
    const groups = items.reduce((acc, item) => {
        const label = formatDateLabel(item[dateField]);

        if (!acc[label]) {
            acc[label] = {
                items: [],
                newestTimestamp: 0,
                // Priority: Today = 2, Yesterday = 1, other = 0
                priority: label === 'Today' ? 2 : label === 'Yesterday' ? 1 : 0
            };
        }

        acc[label].items.push(item);

        // Track newest timestamp for sorting
        const itemTime = new Date(item[dateField] || 0).getTime();
        if (itemTime > acc[label].newestTimestamp) {
            acc[label].newestTimestamp = itemTime;
        }

        return acc;
    }, {});

    // Sort groups: Today > Yesterday > Other dates (newest first)
    const sortedLabels = Object.keys(groups).sort((a, b) => {
        const groupA = groups[a];
        const groupB = groups[b];

        // First sort by priority
        if (groupA.priority !== groupB.priority) {
            return groupB.priority - groupA.priority;
        }

        // Then by newest timestamp
        return groupB.newestTimestamp - groupA.newestTimestamp;
    });

    // Build final sorted object with sorted items
    const result = {};
    sortedLabels.forEach(label => {
        // Sort items within each group by newest first
        result[label] = [...groups[label].items].sort(
            (a, b) => new Date(b[dateField] || 0) - new Date(a[dateField] || 0)
        );
    });

    return result;
};

/**
 * Formats a date for appointment display
 * 
 * @param {Date|string} dateInput - Date to format
 * @returns {string} - Formatted appointment date
 */
export const formatAppointmentDate = (dateInput) => {
    if (!dateInput) return '';

    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '';

    return date.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

/**
 * Gets relative time description (e.g., "2 hours ago", "in 3 days")
 * 
 * @param {Date|string} dateInput - Date to describe
 * @returns {string} - Relative time description
 */
export const getRelativeTime = (dateInput) => {
    if (!dateInput) return '';

    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '';

    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = getDaysDifference(now, date);

    if (diffMs < 0) {
        // Future date
        const absDays = Math.abs(diffDays);
        if (absDays === 0) return 'Today';
        if (absDays === 1) return 'Tomorrow';
        return `in ${absDays} days`;
    }

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return formatDateLabel(dateInput);
};

export default {
    normalizeToMidnight,
    getDaysDifference,
    isToday,
    isYesterday,
    formatDateLabel,
    formatOrderDate,
    formatMessageTime,
    groupByDateLabel,
    formatAppointmentDate,
    getRelativeTime,
};
