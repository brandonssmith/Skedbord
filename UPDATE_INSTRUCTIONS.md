# SkedBord Update Instructions

This document provides step-by-step instructions for updating the SkedBord application while preserving your existing data.

## Important Note
Your data is stored in two places:
1. The browser's local storage
2. A flat file containing your posting data

As long as you follow these instructions carefully, your data will remain intact after the update.

## Files to Preserve
The following files contain your data and should NOT be deleted or modified:
- `src/utils/storage.ts` - Contains the local storage logic
- `data/board.json` (or your custom data file) - Contains all your posting data
- Browser's local storage data (automatically preserved)

## Update Steps

1. **Backup Your Data (Optional but Recommended)**
   - Open the SkedBord application
   - Click on "Tools" in the sidebar
   - Select "Export Data"
   - Choose a date range that includes all your data
   - Save the exported CSV file in a safe location
   - Make a copy of your `data/board.json` file and store it in a safe location

2. **Download the Latest Version**
   - Download the latest version of SkedBord from the source (GitHub repository, etc.)
   - Extract the files to a temporary location

3. **Update Application Files**
   - Copy all files EXCEPT the following from the new version to your existing installation:
     - `src/utils/storage.ts`
     - `data/board.json` (or your custom data file)
   - If prompted to overwrite files, choose "Yes" for all files EXCEPT those listed above

4. **Verify the Update**
   - Open the SkedBord application
   - Check that all your data is still present
   - Verify that new features are working as expected

## Troubleshooting

If you encounter any issues after updating:

1. **Data Not Showing**
   - Check that you didn't modify or delete `src/utils/storage.ts` or `data/board.json`
   - Verify that you're using the same browser where the data was originally stored
   - Try clearing your browser cache (but NOT local storage)
   - Check that your `data/board.json` file is in the correct location

2. **Application Not Working**
   - Check the browser console for error messages
   - Verify that all required dependencies are installed
   - Try running `npm install` to ensure all dependencies are up to date
   - Verify that your `data/board.json` file is properly formatted

## Data Recovery

If you accidentally lose your data:

1. **From Backup**
   - Use the CSV file you exported in step 1
   - Import the data using the "Import Data" feature
   - Restore your `data/board.json` file from the backup copy

2. **From Local Storage and Data File**
   - If you still have access to the original browser installation
   - Export the data before attempting any recovery steps
   - Make sure your `data/board.json` file is intact

## Best Practices

- Always export your data before performing major updates
- Keep your exported data files in a safe location
- Make regular backups of your `data/board.json` file
- Use the same browser for updates to ensure local storage data is preserved
- If switching browsers, export your data first and import it in the new browser
- Keep track of where your `data/board.json` file is located

## Need Help?

If you encounter any issues during the update process:
1. Check the application's documentation
2. Contact Brandon with details about your issue
3. Provide information about:
   - Your browser version
   - The version you're updating from
   - The version you're updating to
   - Any error messages you see
   - The location of your `data/board.json` file 