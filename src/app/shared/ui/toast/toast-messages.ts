/**
 * Central copy for common API / UX outcomes. Import where you show feedback
 * (e.g. `toast.success(ToastCopy.userCreated)`).
 */
export const ToastCopy = {
  userCreated: 'User created successfully.',
  userUpdated: 'User updated successfully.',
  userDeleted: 'User removed.',
  loginFailed: 'Login failed. Check your credentials and try again.',
  loginSuccess: 'Signed in successfully.',
  sessionExpired: 'Your session expired. Please sign in again.',
  saved: 'Changes saved.',
  genericError: 'Something went wrong. Please try again.',
  networkError: 'Network error. Check your connection and try again.',
  forbidden: 'You do not have permission to do that.',
  notFound: 'The requested item could not be found.',
} as const;
