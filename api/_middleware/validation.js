/**
 * Input Validation Middleware
 * Sanitizes and validates user inputs
 */

/**
 * Validate email format
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;

  // RFC 5322 compliant regex (simplified)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid) {
  if (!uuid || typeof uuid !== 'string') return false;

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Sanitize string - remove HTML/script tags
 */
export function sanitizeString(str, maxLength = 1000) {
  if (!str || typeof str !== 'string') return '';

  // Remove HTML tags
  let clean = str.replace(/<[^>]*>/g, '');

  // Remove script content
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Encode special characters
  clean = clean
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  // Trim and limit length
  return clean.trim().substring(0, maxLength);
}

/**
 * Sanitize HTML for email templates (allow basic formatting only)
 */
export function sanitizeHtml(html, maxLength = 5000) {
  if (!html || typeof html !== 'string') return '';

  // Remove dangerous tags
  let clean = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  clean = clean.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  clean = clean.replace(/on\w+\s*=\s*["'][^"']*["']/gi, ''); // Remove event handlers

  // Allow only safe tags
  const allowedTags = ['p', 'br', 'b', 'strong', 'i', 'em', 'u', 'a', 'span', 'div'];
  const tagRegex = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;

  clean = clean.replace(tagRegex, (match, tag) => {
    if (allowedTags.includes(tag.toLowerCase())) {
      return match;
    }
    return '';
  });

  return clean.trim().substring(0, maxLength);
}

/**
 * Validate and sanitize request body
 */
export function validateRequestBody(req, schema) {
  const errors = [];
  const sanitized = {};

  for (const [field, rules] of Object.entries(schema)) {
    const value = req.body[field];

    // Required field check
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      continue;
    }

    // Skip validation if field is optional and not provided
    if (!rules.required && (value === undefined || value === null)) {
      continue;
    }

    // Type validation
    if (rules.type === 'email') {
      if (!isValidEmail(value)) {
        errors.push(`${field} must be a valid email address`);
        continue;
      }
      sanitized[field] = value.toLowerCase().trim();
    } else if (rules.type === 'uuid') {
      if (!isValidUUID(value)) {
        errors.push(`${field} must be a valid UUID`);
        continue;
      }
      sanitized[field] = value;
    } else if (rules.type === 'string') {
      sanitized[field] = sanitizeString(value, rules.maxLength || 1000);
    } else if (rules.type === 'html') {
      sanitized[field] = sanitizeHtml(value, rules.maxLength || 5000);
    } else if (rules.type === 'number') {
      const num = Number(value);
      if (isNaN(num)) {
        errors.push(`${field} must be a number`);
        continue;
      }
      if (rules.min !== undefined && num < rules.min) {
        errors.push(`${field} must be at least ${rules.min}`);
        continue;
      }
      if (rules.max !== undefined && num > rules.max) {
        errors.push(`${field} must be at most ${rules.max}`);
        continue;
      }
      sanitized[field] = num;
    } else if (rules.type === 'boolean') {
      sanitized[field] = Boolean(value);
    } else if (rules.type === 'array') {
      if (!Array.isArray(value)) {
        errors.push(`${field} must be an array`);
        continue;
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`${field} can have at most ${rules.maxLength} items`);
        continue;
      }
      sanitized[field] = value;
    } else {
      // No specific type, just sanitize as string
      sanitized[field] = sanitizeString(String(value));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    data: sanitized
  };
}

/**
 * Middleware wrapper for validation
 */
export function withValidation(schema) {
  return (handler) => {
    return (req, res) => {
      const { valid, errors, data } = validateRequestBody(req, schema);

      if (!valid) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors
        });
      }

      // Replace req.body with sanitized data
      req.validatedData = data;

      return handler(req, res);
    };
  };
}

/**
 * Common validation schemas
 */
export const ValidationSchemas = {
  EMAIL: {
    email: { type: 'email', required: true }
  },

  CONNECTION_EMAIL: {
    senderName: { type: 'string', required: true, maxLength: 100 },
    senderEmail: { type: 'email', required: true },
    senderId: { type: 'uuid', required: false },
    recipientName: { type: 'string', required: true, maxLength: 100 },
    recipientEmail: { type: 'email', required: true },
    message: { type: 'string', required: false, maxLength: 1000 },
    connectionScore: { type: 'number', required: false, min: 0, max: 100 }
  },

  EVENT_SUBMISSION: {
    title: { type: 'string', required: true, maxLength: 200 },
    description: { type: 'string', required: false, maxLength: 2000 },
    date: { type: 'string', required: true },
    location: { type: 'string', required: false, maxLength: 200 },
    url: { type: 'string', required: false, maxLength: 500 }
  }
};
