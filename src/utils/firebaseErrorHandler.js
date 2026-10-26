/**
 * Firebase & System Centralized Error Handling Utility
 * Converts raw Firebase, network, and backend implementation errors into clean, user-friendly messages.
 * Logs original detailed errors internally to the console for debugging.
 */

// Comprehensive mapping of known Firebase auth, firestore, storage, and functions error codes
const ERROR_CODE_MAP = {
  // Auth Errors
  'auth/invalid-credential': 'Invalid email or password.',
  'auth/user-not-found': 'No account found with this email address.',
  'auth/wrong-password': 'Invalid email or password.',
  'auth/email-already-in-use': 'An account with this email address already exists.',
  'auth/weak-password': 'Password should be at least 6 characters long.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-disabled': 'This account has been disabled. Please contact support.',
  'auth/account-exists-with-different-credential': 'An account already exists with the same email using different sign-in credentials.',
  'auth/requires-recent-login': 'Please log in again before retrying this operation.',
  'auth/too-many-requests': 'Too many unsuccessful attempts. Please try again later.',
  'auth/network-request-failed': 'Unable to connect. Please check your internet connection and try again.',
  'auth/invalid-phone-number': 'Please enter a valid phone number.',
  'auth/missing-phone-number': 'Phone number is required.',
  'auth/quota-exceeded': 'SMS quota exceeded. Please try again later.',
  'auth/invalid-verification-code': 'Invalid verification code. Please check and try again.',
  'auth/code-expired': 'The verification code has expired. Please request a new code.',
  'auth/session-expired': 'Session expired. Please request a new verification code.',
  'auth/captcha-check-failed': 'reCAPTCHA verification failed. Please try again.',
  'auth/popup-closed-by-user': 'Sign-in popup was closed before completing the operation.',
  'auth/credential-already-in-use': 'This credential is already associated with a different user account.',
  'auth/operation-not-allowed': 'This operation is currently disabled.',
  'auth/internal-error': 'An internal error occurred. Please try again.',
  'auth/argument-error': 'Invalid inputs provided. Please check your details and try again.',

  // Firestore Errors
  'permission-denied': 'You do not have permission to perform this action.',
  'firestore/permission-denied': 'You do not have permission to perform this action.',
  'not-found': 'The requested item was not found.',
  'firestore/not-found': 'The requested item was not found.',
  'already-exists': 'This record already exists.',
  'firestore/already-exists': 'This record already exists.',
  'resource-exhausted': 'Service is currently busy. Please try again later.',
  'firestore/resource-exhausted': 'Service is currently busy. Please try again later.',
  'failed-precondition': 'Operation cannot be completed in current state.',
  'firestore/failed-precondition': 'Operation cannot be completed in current state.',
  'aborted': 'The operation was aborted. Please try again.',
  'firestore/aborted': 'The operation was aborted. Please try again.',
  'unavailable': 'Service temporarily unavailable. Please check your internet connection.',
  'firestore/unavailable': 'Service temporarily unavailable. Please check your internet connection.',
  'unauthenticated': 'Please log in to continue.',
  'firestore/unauthenticated': 'Please log in to continue.',

  // Firebase Storage Errors
  'storage/unauthorized': 'You do not have permission to access or upload this file.',
  'storage/canceled': 'File upload was canceled.',
  'storage/unknown': 'An unknown error occurred during file upload.',
  'storage/object-not-found': 'File does not exist.',
  'storage/quota-exceeded': 'Storage limit exceeded.',
  'storage/unauthenticated': 'Please log in to upload files.',
  'storage/retry-limit-exceeded': 'Upload timed out. Please check your connection and try again.',
  'storage/invalid-checksum': 'File was corrupted during upload. Please try uploading again.',

  // Cloud Functions Errors
  'functions/cancelled': 'Operation was cancelled.',
  'functions/unknown': 'An unexpected error occurred.',
  'functions/invalid-argument': 'Invalid input provided.',
  'functions/deadline-exceeded': 'The request timed out. Please try again.',
  'functions/not-found': 'Requested resource was not found.',
  'functions/already-exists': 'Resource already exists.',
  'functions/permission-denied': 'Access denied.',
  'functions/resource-exhausted': 'Service is currently busy. Please try again later.',
  'functions/failed-precondition': 'Operation precondition failed.',
  'functions/aborted': 'Operation was aborted.',
  'functions/out-of-range': 'Input parameter out of range.',
  'functions/unimplemented': 'Operation not supported.',
  'functions/internal': 'An internal server error occurred. Please try again.',
  'functions/unavailable': 'Service is temporarily unavailable. Please try again.',
  'functions/data-loss': 'Data processing failure.',
  'functions/unauthenticated': 'Please log in to continue.',
};

/**
 * Parses and returns a user-friendly error message from any error object or message.
 * Logs the raw error to console for developer debugging.
 *
 * @param {Error|Object|string} error - The caught error instance or message
 * @param {string} [fallbackMessage="Something went wrong. Please try again."] - Optional custom fallback
 * @returns {string} Human-friendly error message
 */
export function getFriendlyErrorMessage(error, fallbackMessage = "Something went wrong. Please try again.") {
  // Always log original error internally for developer debugging
  if (error) {
    console.error("[Internal Firebase Error Log]:", error);
  }

  if (!error) return fallbackMessage;

  // Extract message string & error code
  const rawCode = typeof error === 'object' && error?.code ? String(error.code).toLowerCase() : '';
  const rawMessage = typeof error === 'string' ? error : (error?.message || String(error));

  // 1. Direct code lookup from ERROR_CODE_MAP
  if (rawCode && ERROR_CODE_MAP[rawCode]) {
    return ERROR_CODE_MAP[rawCode];
  }

  // 2. Extract code from rawMessage via regex e.g. "Firebase: Error (auth/invalid-credential)" or "(auth/...)"
  const extractedCodeMatch = rawMessage.match(/\((auth\/[a-z0-9-]+|storage\/[a-z0-9-]+|functions\/[a-z0-9-]+|firestore\/[a-z0-9-]+)\)/i) ||
                             rawMessage.match(/\b(auth\/[a-z0-9-]+|storage\/[a-z0-9-]+|functions\/[a-z0-9-]+)\b/i);

  if (extractedCodeMatch && extractedCodeMatch[1]) {
    const code = extractedCodeMatch[1].toLowerCase();
    if (ERROR_CODE_MAP[code]) {
      return ERROR_CODE_MAP[code];
    }
  }

  // 3. Common network / connection error patterns
  if (
    rawMessage.includes('network-request-failed') ||
    rawMessage.includes('ERR_CONNECTION_REFUSED') ||
    rawMessage.includes('Failed to fetch') ||
    rawMessage.includes('Network Error')
  ) {
    return "Unable to connect. Please check your internet connection and try again.";
  }

  // 4. Check if rawMessage is a raw technical Firebase string, stack trace, or internal error
  const isTechnicalError = 
    rawMessage.startsWith('Firebase:') ||
    rawMessage.startsWith('FirebaseError:') ||
    rawMessage.includes('Firebase:') ||
    rawMessage.includes('auth/') ||
    rawMessage.includes('firestore/') ||
    rawMessage.includes('storage/') ||
    rawMessage.includes('functions/') ||
    rawMessage.includes('INTERNAL') ||
    rawMessage.includes('at ') ||
    rawMessage.includes('http');

  if (isTechnicalError) {
    return fallbackMessage;
  }

  // 5. If message is clean human validation text (e.g. "All fields are required", "Please enter a valid 10-digit mobile number")
  if (rawMessage && rawMessage.trim().length > 0 && !isTechnicalError) {
    return rawMessage;
  }

  return fallbackMessage;
}

export default getFriendlyErrorMessage;
