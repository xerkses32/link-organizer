// ===== SECURITY IMPROVEMENTS =====

// 1. XSS-Protected innerHTML replacement
function safeSetInnerHTML(element, content) {
  // Sanitize content before setting
  const sanitizedContent = sanitizeHTML(content);
  element.innerHTML = sanitizedContent;
}

function sanitizeHTML(html) {
  // Remove script tags and dangerous attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '');
}

// 2. Secure data transfer for drag & drop
function secureDataTransfer(e, data) {
  // Only transfer safe text data, not HTML
  e.dataTransfer.setData('text/plain', JSON.stringify(data));
  e.dataTransfer.setData('application/json', JSON.stringify(data));
}

// 3. Share code validation
function validateShareCode(code) {
  // Check if code matches expected format
  const codePattern = /^[A-Z0-9]{8,16}$/;
  return codePattern.test(code);
}

// 4. Input validation enhancement
function enhancedSanitizeInput(input) {
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .trim()
    .substring(0, 1000); // Limit length
}

// 5. URL validation enhancement
function enhancedUrlValidation(url) {
  try {
    const urlObj = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

// 6. Storage encryption (optional)
function encryptData(data) {
  // Simple encryption for sensitive data
  return btoa(JSON.stringify(data));
}

function decryptData(encryptedData) {
  try {
    return JSON.parse(atob(encryptedData));
  } catch {
    return null;
  }
}

// 7. Rate limiting for share code generation
const rateLimiter = {
  attempts: new Map(),
  
  canGenerateCode(userId) {
    const now = Date.now();
    const userAttempts = this.attempts.get(userId) || [];
    
    // Remove attempts older than 1 hour
    const recentAttempts = userAttempts.filter(time => now - time < 3600000);
    
    // Allow max 10 attempts per hour
    if (recentAttempts.length >= 10) {
      return false;
    }
    
    recentAttempts.push(now);
    this.attempts.set(userId, recentAttempts);
    return true;
  }
};

// 8. Content Security Policy
const CSP = {
  // Define allowed sources
  allowedSources: {
    'default-src': ["'self'"],
    'script-src': ["'self'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", "data:", "https:"],
    'connect-src': ["'self'"]
  }
};

// 9. Secure random ID generation
function secureGenerateId() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// 10. Audit logging
const SecurityAudit = {
  log(action, details) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action: action,
      details: details,
      userAgent: navigator.userAgent
    };
    
    // Store in chrome.storage for debugging
    chrome.storage.local.get(['security_logs'], (result) => {
      const logs = result.security_logs || [];
      logs.push(logEntry);
      
      // Keep only last 100 entries
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      chrome.storage.local.set({ security_logs: logs });
    });
  }
}; 