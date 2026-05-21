# Error Display Examples

## Visual Guide to Error Feedback System

### 1. Critical Error with Full Diagnostics

When a critical API error occurs (e.g., failed to load builds), users see:

```
┌─────────────────────────────────────────────────────────────┐
│ 🔴 Request Failed                                        [X] │
│                                                             │
│ Server error. Our team has been notified.                  │
│                                                             │
│ Endpoint: GET /api/build                                   │
│ Status: 500                                                │
│ Time: 5/21/2026, 2:30:45 PM                               │
│ Context: Loading builds                                    │
├─────────────────────────────────────────────────────────────┤
│ ▶ Technical Details                           [Copy]       │
└─────────────────────────────────────────────────────────────┘
```

**Expanded view:**

```
┌─────────────────────────────────────────────────────────────┐
│ 🔴 Request Failed                                        [X] │
│                                                             │
│ Server error. Our team has been notified.                  │
│                                                             │
│ Endpoint: GET /api/build                                   │
│ Status: 500                                                │
│ Time: 5/21/2026, 2:30:45 PM                               │
│ Context: Loading builds                                    │
├─────────────────────────────────────────────────────────────┤
│ ▼ Technical Details                           [Copied!]    │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Request                                             │   │
│ │ GET /api/build                                      │   │
│ │                                                     │   │
│ │ Response Status                                     │   │
│ │ 500                                                 │   │
│ │                                                     │   │
│ │ Response Body                                       │   │
│ │ {                                                   │   │
│ │   "error": "Database connection timeout",           │   │
│ │   "detail": "Failed to connect to primary DB"      │   │
│ │ }                                                   │   │
│ │                                                     │   │
│ │ Error Message                                       │   │
│ │ Database connection timeout                         │   │
│ │                                                     │   │
│ │ Timestamp                                           │   │
│ │ 2026-05-21T14:30:45.123Z                           │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 2. Non-Critical API Errors (Amber Warnings)

When an operation fails but flow continues with fallback:

```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️  API Error: Generate Build Name                      [X] │
│                                                             │
│ Server error. Our team has been notified.                  │
│                                                             │
│ 2:31:15 PM - Flow continued with mock/fallback data        │
└─────────────────────────────────────────────────────────────┘
```

### 3. Multiple Errors Display

When several operations fail:

```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️  API Error: Load Builds                              [X] │
│ Server error. Our team has been notified.                  │
│ 2:30:45 PM - Flow continued with mock/fallback data        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ⚠️  API Error: Generate Build Name                      [X] │
│ Failed to connect to naming service                         │
│ 2:31:15 PM - Flow continued with mock/fallback data        │
└─────────────────────────────────────────────────────────────┘

[Rest of page content...]

┌─────────────────────────────────────────────────────────────┐
│ ℹ️  Diagnostic Information                                  │
│                                                             │
│ Status: The build flow continued with fallback data         │
│         despite API errors.                                 │
│                                                             │
│ Total API Errors: 2                                        │
│                                                             │
│ Error Log:                                                 │
│ ┌───────────────────────────────────────────────────┐     │
│ │ [14:30:45] Load Builds                            │     │
│ │     Failed to load builds (500): Database         │     │
│ │     connection timeout                            │     │
│ │                                                   │     │
│ │ [14:31:15] Generate Build Name                    │     │
│ │     Failed to generate build name: Network        │     │
│ │     timeout                                       │     │
│ └───────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### 4. SSE Stream Error

When the Server-Sent Events stream fails:

```
┌─────────────────────────────────────────────────────────────┐
│ 🔴 Error                                                    │
│                                                             │
│ Connection lost. The build may still be processing in       │
│ the background.                                            │
└─────────────────────────────────────────────────────────────┘
```

### 5. Development Mode Banner

When API is unavailable and mock data is being used:

```
┌─────────────────────────────────────────────────────────────┐
│ 🔧 DEV MODE: Using mock streaming data - backend           │
│             unavailable                                     │
└─────────────────────────────────────────────────────────────┘
```

Or when errors occurred but flow continued:

```
┌─────────────────────────────────────────────────────────────┐
│ 🔧 DEV MODE: 3 API error(s) - flow continued with          │
│             fallbacks                                       │
└─────────────────────────────────────────────────────────────┘
```

## Error Flow Examples

### Scenario 1: Complete API Failure

**User Action:** Opens dashboard  
**What Happens:**
1. Load builds API call fails (500 error)
2. Critical error panel appears with full diagnostics
3. Dev mode banner shows "API error(s)"
4. Empty builds list shown
5. User can still create new build (creates mock build)

**User Sees:**
- Red error panel with expandable diagnostics
- "Server error. Our team has been notified."
- Copy button to share error details
- Application continues to work with offline mode

### Scenario 2: Partial Failure During Build Start

**User Action:** Submits build prompt  
**What Happens:**
1. Generate name API call fails
2. Amber warning appears: "API Error: Generate Build Name"
3. Build continues with default name "New Build"
4. Update build API succeeds
5. Build stream starts normally

**User Sees:**
- Brief amber warning (dismissible)
- Build starts successfully
- Default name used instead of AI-generated one
- Clear indication of what went wrong

### Scenario 3: Network Completely Offline

**User Action:** Opens dashboard  
**What Happens:**
1. All API calls fail with network errors
2. Multiple error panels appear
3. Dev mode banner shows errors
4. Mock builds created for testing
5. SSE stream falls back to mock data

**User Sees:**
- Multiple dismissible error warnings
- Dev mode banner at top
- Application continues to function
- Diagnostic panel at bottom with full error log

## Copy-to-Clipboard Format

When user clicks "Copy" on error diagnostics:

```json
{
  "error": "Database connection timeout",
  "endpoint": "/api/build",
  "method": "GET",
  "status": 500,
  "timestamp": "2026-05-21T14:30:45.123Z",
  "context": "Loading builds",
  "requestPayload": null,
  "responseBody": {
    "error": "Database connection timeout",
    "detail": "Failed to connect to primary DB"
  }
}
```

This format is:
- Valid JSON for easy parsing
- Includes all diagnostic information
- Can be pasted directly into bug reports
- Contains timestamps for correlation

## Color Coding

- 🔴 **Red**: Critical errors that require user attention
- ⚠️ **Amber**: Warnings where flow continued with fallback
- ℹ️ **Gray**: Diagnostic information panel
- 🔧 **Blue**: Development mode indicators
- ✅ **Green**: Successful completions (department cards)

## Interactive Elements

1. **Dismiss [X]**: Closes error panel
2. **Expand ▼**: Shows technical details
3. **Collapse ▶**: Hides technical details  
4. **Copy**: Copies JSON diagnostics to clipboard
5. **Copied!**: Confirmation feedback after copy

## Accessibility Features

- Clear error hierarchy (critical vs warning)
- Keyboard navigable (tab through errors)
- Screen reader friendly (proper ARIA labels)
- High contrast error colors
- Large touch targets for mobile
