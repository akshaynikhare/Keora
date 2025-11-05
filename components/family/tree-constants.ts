// ============================================
// FAMILY TREE CONFIGURATION CONSTANTS
// ============================================
// Centralized configuration for all family tree node sizes and spacing
// Update these values to adjust the appearance of the family tree

// Node Size Configuration
export const NORMAL_NODE_WIDTH = 140;      // Width of regular family member nodes
export const NORMAL_NODE_HEIGHT = 120;     // Height of regular family member nodes
export const LARGE_NODE_WIDTH = 200;       // Width of main user (primary) node
export const LARGE_NODE_HEIGHT = 180;      // Height of main user (primary) node
export const HEART_NODE_WIDTH = 60;        // Width of heart (spouse connection) node
export const HEART_NODE_HEIGHT = 60;       // Height of heart (spouse connection) node

// Photo Size Configuration
export const NORMAL_PHOTO_SIZE = 80;       // Photo size for regular nodes (in px)
export const LARGE_PHOTO_SIZE = 120;       // Photo size for main user node (in px)

// Text Size Configuration (Tailwind classes)
export const NORMAL_TEXT_SIZE = 'text-sm';     // Text size for regular nodes
export const LARGE_TEXT_SIZE = 'text-base';    // Text size for main user node

// Badge Size Configuration (Tailwind classes)
export const NORMAL_BADGE_SIZE = 'w-6 h-6 text-xs';       // Badge size for regular nodes
export const LARGE_BADGE_SIZE = 'w-8 h-8 text-base';      // Badge size for main user node

// Initials Size Configuration (Tailwind classes)
export const NORMAL_INITIALS_SIZE = 'text-2xl';    // Initials size for regular nodes
export const LARGE_INITIALS_SIZE = 'text-4xl';     // Initials size for main user node

// Spacing Configuration
export const HORIZONTAL_SPACING = 300;              // Horizontal space between family branches
export const VERTICAL_SPACING = 280;                // Vertical space between generations
export const SPOUSE_HORIZONTAL_SPACING = 200;        // Distance between spouse pairs

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get the photo size based on whether the node is large (primary user)
 */
export const getPhotoSize = (isLarge: boolean): string => {
  return `${isLarge ? LARGE_PHOTO_SIZE : NORMAL_PHOTO_SIZE}px`;
};

/**
 * Get the text size class based on whether the node is large (primary user)
 */
export const getTextSize = (isLarge: boolean): string => {
  return isLarge ? LARGE_TEXT_SIZE : NORMAL_TEXT_SIZE;
};

/**
 * Get the badge size class based on whether the node is large (primary user)
 */
export const getBadgeSize = (isLarge: boolean): string => {
  return isLarge ? LARGE_BADGE_SIZE : NORMAL_BADGE_SIZE;
};

/**
 * Get the initials size class based on whether the node is large (primary user)
 */
export const getInitialsSize = (isLarge: boolean): string => {
  return isLarge ? LARGE_INITIALS_SIZE : NORMAL_INITIALS_SIZE;
};
