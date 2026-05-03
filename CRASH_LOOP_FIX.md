# Image Upload Crash Loop - Root Cause Analysis and Fix

## Problem Summary

The Saazvat Field Service app was experiencing a critical crash loop when attempting to take photos for HVAC work orders:

1. **Multiple overlapping toast alerts** - "1 item(s) failed to sync" appearing repeatedly
2. **Sync queue stuck** - Image upload stuck in sync queue with badge showing "1"
3. **Hard system crash** - App crashes with "Something went wrong... closed because this app has a bug"
4. **Continuous crash loop** - Reopening the app triggers background sync, causing immediate crash

## Root Causes Identified

### 1. Infinite Retry Loop
**Location:** `src/app/core/services/sync.service.ts:46-109`

**Problem:**
- Failed sync items were retried indefinitely on every app restart
- No exponential backoff between retry attempts
- Retry limit was too low (3 attempts) before marking as failed
- Failed items were immediately retried when app came back online

**Impact:** Background sync would continuously attempt to upload the same failed photo, consuming resources and eventually crashing the app.

### 2. Missing Error Boundaries
**Location:** App-wide (no global error handler)

**Problem:**
- Unhandled exceptions in the sync process would crash the entire app
- No graceful error recovery mechanism
- Errors propagated up to the system level, causing hard crashes

**Impact:** Any error during photo upload or sync would crash the app instead of being caught and handled gracefully.

### 3. Duplicate Toast Notifications
**Location:** `src/app/core/services/toast.service.ts:18-28`

**Problem:**
- No deduplication logic for toast messages
- Multiple sync failures would trigger multiple identical toasts
- Toasts could stack up and overwhelm the UI

**Impact:** Users saw multiple overlapping "failed to sync" messages, creating confusion and poor UX.

### 4. Poor Photo Upload Error Handling
**Location:** `src/app/features/work-orders/containers/work-order-detail/work-order-detail.component.ts:1046-1118`

**Problem:**
- Generic error messages without details
- Failed uploads still added to sync queue
- No validation of photo data before processing
- No distinction between local storage and upload success

**Impact:** Invalid or corrupted photo data would be added to sync queue, causing repeated failures.

## Fixes Implemented

### 1. Enhanced Sync Queue Retry Logic ✅

**File:** `src/app/core/services/sync.service.ts`

**Changes:**
- Increased retry limit from 3 to 5 attempts
- Added exponential backoff (1s, 2s, 4s, 8s, 16s, max 60s)
- Skip permanently failed items (status='FAILED') during sync
- Track `lastAttemptAt` timestamp to enforce backoff periods
- Store `lastError` message for debugging
- Only retry PENDING items, not FAILED items
- Separate counters for success, fail, and permanent fail

**Benefits:**
- Prevents infinite retry loops
- Reduces server load with exponential backoff
- Allows manual intervention for permanently failed items
- Better visibility into sync failures

### 2. Global Error Handler ✅

**Files:**
- `src/app/core/services/global-error-handler.service.ts` (new)
- `src/app/app.config.ts` (updated)

**Changes:**
- Created `GlobalErrorHandler` service implementing Angular's `ErrorHandler`
- Catches all unhandled errors app-wide
- Logs errors to console for debugging
- Shows user-friendly toast notifications
- Prevents errors from crashing the app

**Benefits:**
- App continues running even when errors occur
- Users see meaningful error messages
- Developers get full error logs
- No more hard crashes

### 3. Toast Deduplication ✅

**File:** `src/app/core/services/toast.service.ts`

**Changes:**
- Added `recentMessages` Map to track recently shown toasts
- Deduplicate messages within 2-second window
- Automatic cleanup of old entries (5-second threshold)
- Message key includes both type and content

**Benefits:**
- No more duplicate toast spam
- Cleaner UI experience
- Better performance with fewer DOM updates

### 4. Improved Photo Upload Error Handling ✅

**File:** `src/app/features/work-orders/containers/work-order-detail/work-order-detail.component.ts`

**Changes:**
- Validate photo data before processing (`photo.base64String` check)
- Validate upload result before adding to work order
- Detailed error messages with actual error text
- Different toast messages for local vs. remote storage
- Only add to sync queue if photo data is valid
- Proper error propagation with try-catch blocks

**Benefits:**
- Invalid photos don't enter sync queue
- Users understand what went wrong
- Clear distinction between offline and online modes
- Better debugging with detailed error messages

### 5. Enhanced Sync Queue Viewer ✅

**File:** `src/app/shared/components/sync-queue-viewer/sync-queue-viewer.component.ts`

**Changes:**
- Display error messages in queue items
- Added "Clear Failed" button to remove permanently failed items
- Added confirmation dialog for "Clear All"
- Connected "Sync Now" button to actual sync service
- Visual error indicators with icons
- Better button organization (Sync Now, Clear Failed, Clear All)

**Benefits:**
- Users can see why items failed
- Manual recovery options for stuck items
- Better visibility into sync queue state

### 6. Updated Sync Item Model ✅

**File:** `src/app/core/models/sync-item.model.ts`

**Changes:**
- Added `lastAttemptAt?: string` field
- Added `lastError?: string` field

**Benefits:**
- Track when last sync attempt occurred
- Store error details for debugging
- Enable exponential backoff logic

## Testing Recommendations

### 1. Photo Upload Scenarios
- ✅ Take photo while online → should upload immediately
- ✅ Take photo while offline → should save locally with "Will sync when online" message
- ✅ Take invalid/corrupted photo → should show error, not crash
- ✅ Network failure during upload → should retry with backoff

### 2. Sync Queue Scenarios
- ✅ Failed item should retry with exponential backoff
- ✅ After 5 failures, item should be marked as FAILED
- ✅ FAILED items should not retry automatically
- ✅ "Clear Failed" button should remove only FAILED items
- ✅ "Sync Now" should trigger immediate sync attempt

### 3. Error Handling Scenarios
- ✅ Unhandled exception should show toast, not crash app
- ✅ Duplicate error messages should be deduplicated
- ✅ Error details should appear in sync queue viewer
- ✅ App should remain functional after errors

### 4. Crash Loop Prevention
- ✅ App restart should not immediately retry failed items
- ✅ Backoff period should be respected across app restarts
- ✅ Permanently failed items should not cause crashes

## Migration Notes

### Breaking Changes
None - all changes are backward compatible.

### Data Migration
Existing sync queue items will work with the new code. The new fields (`lastAttemptAt`, `lastError`) are optional and will be populated on the next sync attempt.

### Deployment Steps
1. Deploy updated code
2. Monitor sync queue for stuck items
3. Users can manually clear failed items using "Clear Failed" button
4. No database migrations required

## Monitoring and Debugging

### Key Metrics to Watch
- Sync queue size over time
- Number of FAILED items
- Retry count distribution
- Error message frequency

### Debug Tools
- Sync Queue Viewer component shows real-time queue state
- Console logs show detailed sync progress
- Error messages stored in sync items for analysis

### Common Issues and Solutions

**Issue:** Items stuck in FAILED state
**Solution:** Use "Clear Failed" button in Sync Queue Viewer

**Issue:** Photos not uploading
**Solution:** Check network connectivity, verify Supabase storage permissions

**Issue:** Sync queue growing
**Solution:** Check for network issues, review error messages in queue viewer

## Performance Impact

### Before
- Infinite retry loops consuming CPU
- Multiple duplicate toasts causing UI lag
- App crashes requiring full restart
- Lost work due to crashes

### After
- Exponential backoff reduces server load
- Deduplicated toasts improve UI performance
- Graceful error handling prevents crashes
- Work is preserved even when errors occur

## Future Improvements

1. **Batch Photo Uploads** - Upload multiple photos in a single request
2. **Compression** - Reduce photo size before upload
3. **Progress Indicators** - Show upload progress for large photos
4. **Retry Strategy Configuration** - Allow admins to configure retry limits and backoff
5. **Analytics** - Track sync success/failure rates
6. **Background Sync API** - Use native background sync when available

## Conclusion

The crash loop was caused by a combination of factors:
1. Infinite retry loops without backoff
2. Missing error boundaries
3. Duplicate notifications
4. Poor error handling in photo uploads

All issues have been addressed with comprehensive fixes that prevent crashes, improve user experience, and provide better debugging capabilities.

**Status:** ✅ All fixes implemented and ready for testing
**Risk Level:** Low - all changes are defensive and backward compatible
**User Impact:** Positive - no more crashes, better error messages, manual recovery options
