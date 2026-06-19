// Shared validation patterns for class-validator DTOs

export const PHONE_PATTERN = /^\+?[0-9\s\-()]{7,20}$/;

export const PHONE_VALIDATION_MESSAGE =
  'Phone must be 7–20 digits and may include +, spaces, hyphens, or parentheses';
