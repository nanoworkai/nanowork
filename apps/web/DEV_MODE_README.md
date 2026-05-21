# Development Mode Fallbacks

This feature allows frontend developers to work on the UI and see the full build flow even when the backend is unavailable.

## Features

### 1. **Mock Data Generation**
When API calls fail in development mode (`NODE_ENV === 'development'`), the system automatically falls back to mock data:

- **Build Creation**: Returns mock build objects with realistic IDs and metadata
- **Build Name Generation**: Generates names from the prompt text
- **SSE Streaming**: Simulates real-time department updates with mock tasks and progress

### 2. **Development Mode Banner**
A dismissible amber banner appears at the top of the screen when:
- Mock streaming data is being used
- API errors occurred but the flow continued with fallbacks

### 3. **Error Diagnostics**
All API errors are tracked and displayed:
- Individual dismissible error cards with operation name and error details
- Diagnostic summary panel showing all errors in chronological order
- Clear indication that the flow continued despite errors

### 4. **Seamless Fallback**
The system attempts real API calls first, then:
1. Catches network errors or HTTP errors
2. Logs detailed diagnostic information
3. Returns mock data in development mode
4. Allows the UI flow to continue normally

## Components

### Core Files

- **`/src/lib/devMode.ts`**: Mock data generators and utilities
- **`/src/components/DevModeBanner.tsx`**: Banner component for dev mode indication
- **`/src/dashboard/Overview.tsx`**: Updated with SSE fallback support
- **`/src/dashboard/OverviewNew.tsx`**: Updated with API error handling and fallbacks

### Key Functions

#### `MockEventSource`
Simulates Server-Sent Events (SSE) for streaming build updates:
```typescript
const mockEs = new MockEventSource(prompt);
mockEs.addEventListener('meta', (e) => {
  // Handle meta events
});
```

#### `generateMockStreamEvents()`
Generator function that yields realistic department events:
- Meta event with company name and tagline
- Department start events
- Task completion events
- Department done events
- Build complete event

#### `fetchWithDevFallback()`
Wrapper for fetch that automatically falls back to mock data:
```typescript
const { data, error, isMock } = await fetchWithDevFallback(
  url,
  options,
  mockData,
  'Operation Name'
);
```

## Usage

### Running in Development Mode

```bash
# Start the frontend dev server
cd apps/web
npm run dev
```

### Testing Fallback Behavior

1. **Without Backend Running**:
   - Start the frontend server without the backend
   - Create a new build and enter a prompt
   - Watch the mock streaming data populate departments

2. **With Backend Errors**:
   - Backend returns errors or is unreachable
   - Frontend shows diagnostic errors
   - Flow continues with fallback data

### Customizing Mock Data

Edit `/src/lib/devMode.ts` to customize:

- **Department configurations**: Modify `MOCK_DEPARTMENTS` array
- **Task templates**: Update `generateMockTasksForDept()`
- **Output messages**: Customize `generateMockOutputForDept()`
- **Streaming timing**: Adjust delay in `MockEventSource.startStreaming()`

## Design Decisions

### Why Mock Data on Error?
1. **Frontend development velocity**: Designers and frontend devs can work without backend
2. **Demo capability**: Show full flow for demos even with backend issues
3. **Better DX**: Clear visual feedback vs blank error states
4. **Preserves diagnostics**: Real errors are still visible and logged

### Why Only in Development?
- Production should fail fast and show real errors
- Mock data could mask production issues
- Clear separation between dev and prod behavior

### Why Automatic Fallback?
- Manual switching would be tedious
- Automatic detection works for most cases
- Banner clearly indicates when mock data is used

## Monitoring

### Console Logging
All fallback activations are logged with `[DEV MODE]` prefix:
```
[DEV MODE] SSE connection failed, using mock stream
[DEV MODE] Create Build failed (network error), using mock data
```

### Visual Indicators
- **Amber banner**: Shows when mock data is active
- **Error cards**: Dismissible cards for each API error
- **Diagnostic panel**: Detailed error log at bottom of build view

## Future Enhancements

Potential improvements:
- [ ] Configurable mock data via localStorage
- [ ] Mock data presets for different scenarios
- [ ] Slower/faster streaming speed controls
- [ ] Error injection for testing error states
- [ ] Mock API server mode for more realistic testing
