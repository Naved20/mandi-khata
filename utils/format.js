/**
 * Utility functions for formatting values in the Mandi Dashboard
 */

/**
 * Format amount as Indian Rupees (INR)
 * @param {number} amount - The amount to format
 * @returns {string} Formatted amount like "₹1,23,456.50"
 */
export const INR = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format large numbers compactly (e.g., 1.2M, 500K, 10L)
 * @param {number} amount - The amount to format
 * @returns {string} Compact representation
 */
export const compactNumber = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '0';
  
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  
  if (absAmount >= 10000000) {
    return sign + (absAmount / 10000000).toFixed(1) + ' Cr';
  }
  if (absAmount >= 100000) {
    return sign + (absAmount / 100000).toFixed(1) + ' L';
  }
  if (absAmount >= 1000) {
    return sign + (absAmount / 1000).toFixed(1) + ' K';
  }
  
  return amount.toString();
};

/**
 * Format date in Indian format
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted date like "27/06/2026"
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Format date and time in Indian format
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted date and time like "27/06/2026, 3:30 PM"
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Format quantity with unit
 * @param {number} quantity - The quantity
 * @param {string} unit - The unit (e.g., 'kg', 'quintals', 'tons')
 * @returns {string} Formatted quantity with unit
 */
export const formatQuantity = (quantity, unit = '') => {
  if (quantity === null || quantity === undefined) return '0';
  
  const formatted = new Intl.NumberFormat('en-IN').format(quantity);
  return unit ? `${formatted} ${unit}` : formatted;
};
