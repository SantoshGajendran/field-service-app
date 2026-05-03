# Offline Support - Quick Testing Guide

## 🚀 Quick Test (5 minutes)

### Test 1: Basic Offline Mode
1. Open the app and login
2. Go to a work order
3. **Enable airplane mode** on your device
4. ✅ Red "You're offline" banner should appear
5. Update the work order description
6. ✅ Changes saved locally
7. ✅ Sync FAB shows "1 pending"
8. **Disable airplane mode**
9. ✅ Blue "Syncing..." banner appears
10. ✅ Success toast: "Synced 1 item(s) successfully"
11. ✅ FAB badge clears

### Test 2: Offline Photos
1. **Enable airplane mode**
2. Open a work order
3. Click "Take Photo" or "Gallery"
4. Select/capture a photo
5. ✅ Photo appears immediately in gallery
6. ✅ Photo stored as base64 (data URL)
7. ✅ Sync FAB shows pending count
8. **Disable airplane mode**
9. ✅ Photo uploads to Supabase
10. ✅ URL changes from data: to https://

### Test 3: Offline Signature
1. **Enable airplane mode**
2. Complete a work order (status = COMPLETED)
3. Click "Add Signature"
4. Draw signature and save
5. ✅ Signature appears immediately
6. ✅ Stored as data URL locally
7. **Disable airplane mode**
8. ✅ Signature uploads to Supabase
9. ✅ URL changes to cloud URL

### Test 4: Multiple Offline Changes
1. **Enable airplane mode**
2. Update 3 different work orders
3. Take 2 photos
4. Add 1 signature
5. ✅ FAB shows "6 pending"
6. **Disable airplane mode**
7. ✅ All items sync in order
8. ✅ Success toast shows count
9. ✅ FAB badge clears

### Test 5: Manual Sync
1. Make changes while online
2. ✅ FAB shows pending count
3. Tap the sync FAB button
4. ✅ Immediate sync starts
5. ✅ Spinner animation shows
6. ✅ Items sync successfully

## 🔍 What to Look For

### Visual Indicators:
- ✅ Red banner when offline
- ✅ Blue banner when syncing
- ✅ FAB badge with pending count
- ✅ Spinner animation during sync
- ✅ Success/error toasts

### Functionality:
- ✅ All CRUD operations work offline
- ✅ Photos display immediately
- ✅ Signatures display immediately
- ✅ Auto-sync on reconnection
- ✅ Manual sync works
- ✅ No data loss

### Edge Cases:
- ✅ Rapid online/offline switching
- ✅ Large photos (2-5MB)
- ✅ Multiple simultaneous changes
- ✅ App restart with pending items
- ✅ Sync failures retry correctly

## 🐛 Common Issues

### Issue: Sync not starting
**Solution:** 
- Check network indicator shows "ONLINE"
- Tap sync FAB manually
- Check browser console for errors

### Issue: Photos not uploading
**Solution:**
- Verify Supabase Storage bucket exists
- Check RLS policies allow uploads
- Verify photos show as `isLocal: true` in data

### Issue: Pending count not updating
**Solution:**
- Refresh the page
- Check IndexedDB for sync_queue table
- Verify sync service is running

## 📱 Testing on Device vs Browser

### Browser Testing:
- Use Chrome DevTools Network tab
- Select "Offline" from throttling dropdown
- Easier to debug with console
- Faster iteration

### Device Testing:
- Use airplane mode
- More realistic scenario
- Test actual camera/gallery
- Verify battery impact

## ✅ Success Criteria

All these should work:
- [x] Offline banner appears when offline
- [x] Sync banner appears when syncing
- [x] FAB shows pending count
- [x] Manual sync works
- [x] Auto-sync on reconnection
- [x] Photos work offline
- [x] Signatures work offline
- [x] Work order updates work offline
- [x] Checklist updates work offline
- [x] Toast notifications show
- [x] No data loss
- [x] No errors in console

## 🎯 Next Steps After Testing

1. **If all tests pass:**
   - Build APK
   - Deploy to test devices
   - Train users on offline features

2. **If issues found:**
   - Check browser console
   - Review sync queue in IndexedDB
   - Check network service status
   - Verify Supabase connection

3. **Performance testing:**
   - Test with 50+ pending items
   - Test with large photos (5MB+)
   - Test with slow 3G connection
   - Monitor battery usage

---

**Ready to test!** Start with Test 1 and work through all 5 tests.
