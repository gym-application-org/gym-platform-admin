# Intelligent Error Handling System

This utility provides intelligent error categorization and consistent messaging for the entire application.

## Features

- ✅ **Automatic Error Classification** - Detects error types (user activation, authentication, validation, etc.)
- ✅ **Original Messages** - Uses your actual error messages from the server/API
- ✅ **Consistent Handling** - Standardized error processing across the application
- ✅ **Smart Duration** - Appropriate display times based on error severity
- ✅ **Professional UX** - Different toast types for different error categories

## Usage

### Basic Error Categorization

```typescript
import { ErrorExtractor, ErrorCategory } from 'src/app/utils';

const errorInfo: ErrorCategory = ErrorExtractor.categorizeError(errorMessage);

console.log({
  type: errorInfo.type,           // 'user-activation', 'authentication', etc.
  severity: errorInfo.severity,   // 'info', 'warning', 'error'
  title: errorInfo.title,         // Turkish title for UI
  userFriendlyMessage: errorInfo.userFriendlyMessage, // Your original error message
  duration: errorInfo.duration    // Recommended display time
});
```

### With Toast Service

```typescript
import { ErrorExtractor } from 'src/app/utils';
import { ToastService } from 'src/app/pages/ui-components/toastr/toast.service';

private handleError(errorMessage: string, isSystemError = false): void {
  const errorInfo = ErrorExtractor.categorizeError(errorMessage, isSystemError);
  
  switch (errorInfo.severity) {
    case 'info':
      this.toastService.info(errorInfo.userFriendlyMessage, errorInfo.title, {
        duration: errorInfo.duration,
        showProgressBar: true
      });
      break;
      
    case 'warning':
      this.toastService.warning(errorInfo.userFriendlyMessage, errorInfo.title, {
        duration: errorInfo.duration
      });
      break;
      
    case 'error':
    default:
      this.toastService.error(errorInfo.userFriendlyMessage, errorInfo.title, {
        duration: errorInfo.duration
      });
      break;
  }
}
```

## Error Types

### User Activation (`user-activation`)
- **Type**: Info toast (blue)
- **Title**: "Bilgilendirme"
- **Duration**: 6000ms
- **Use Case**: New users requiring admin approval

**Detected Keywords**: 
- "aktifleştirilmesi gerekiyor"
- "yönetici tarafından aktif"
- "hesap onaylanmamış"
- etc.

### Authentication (`authentication`)
- **Type**: Error toast (red)
- **Title**: "Giriş Hatası"
- **Duration**: 3000ms
- **Use Case**: Invalid username/password

### Authorization (`authorization`)
- **Type**: Warning toast (orange)
- **Title**: "Yetki Hatası"
- **Duration**: 4000ms
- **Use Case**: Insufficient permissions

### Validation (`validation`)
- **Type**: Warning toast (orange)
- **Title**: "Geçersiz Bilgi"
- **Duration**: 3500ms
- **Use Case**: Invalid input format

### Network (`network`)
- **Type**: Error toast (red)
- **Title**: "Bağlantı Hatası"
- **Duration**: 4000ms
- **Use Case**: Connection timeouts, server unreachable

### System (`system`)
- **Type**: Error toast (red)
- **Title**: "Sistem Hatası"
- **Duration**: 3500ms
- **Use Case**: Internal server errors

## Benefits

1. **Consistency** - Same error handling logic across all components
2. **Original Messages** - Preserves your exact error messages from the server
3. **Maintainability** - Single place to update error logic
4. **Extensibility** - Easy to add new error types
5. **Independence** - No component coupling

## Integration Example

```typescript
// In any service or component
import { ErrorExtractor } from 'src/app/utils';

// API error handling
.pipe(
  catchError((error: HttpErrorResponse) => {
    const message = ErrorExtractor.extractErrorMessage(error);
    return of(Result.error(new Error(message)));
  })
)

// Component error handling
.subscribe({
  error: (error) => {
    this.handleError(error.message, true); // true = system error
  }
});
```
