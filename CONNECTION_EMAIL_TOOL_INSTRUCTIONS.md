# BudE Connection Email Generator - Usage Instructions

## What This Tool Does

Generates beautiful, personalized HTML email cards for connecting your beta testers. Takes data from your Google Sheet and creates branded connection emails you can paste directly into Gmail.

## Quick Start (5 minutes)

### Step 1: Open the Tool
1. Double-click `connection-email-generator.html` in your bude-app folder
2. It will open in your browser (Chrome, Edge, or Firefox work best)

### Step 2: Get Your Google Sheet Data
1. Open your Google Sheet with Form_Responses
2. Select the columns you need:
   - Column A (Timestamp) - optional
   - Column B (First Name) ✅
   - Column C (Last Name) ✅
   - Column D (Username) - optional
   - Column E (Email) ✅
   - Column F (Job Title) ✅
   - Column G (Company) ✅
   - Column H (Zip Code) - optional
   - Column I (Industry) ✅
   - Column S (Professional Interests) ✅
   - Column U (Personal Interests) - optional
   - Column V (Networking Goals) - optional

3. **Important:** Select ALL your user rows (not just the headers)
4. Copy the data (Ctrl+C or Cmd+C)

### Step 3: Paste into Tool
1. In the tool, paste your data into the big text box (Step 1)
2. Click "Parse Data"
3. You should see a green message: "Successfully loaded X users!"

### Step 4: Choose What to Show
In Step 2, check/uncheck which fields you want on the cards:
- ✅ Name (always shown)
- ✅ Job Title (recommended)
- ✅ Company (recommended)
- ✅ Industry (recommended)
- ✅ Professional Interests (recommended)
- ⬜ Personal Interests (optional - use for more casual connections)
- ⬜ Networking Goals (optional - can feel too formal)
- ⬜ Email (optional - you can introduce them first)

**Pro tip:** For first connections, I'd show: Name, Title, Company, Industry, Professional Interests

### Step 5: Select People
In Step 3:
1. Pick who you're sending the email TO (the recipient)
2. Pick their first connection recommendation
3. Pick their second connection recommendation

### Step 6: Add Your Personal Touch
In Step 4:
- The opening message auto-fills with their first name
- Add WHY you're connecting them:
  - Connection #1: "You both mentioned interest in event marketing, and Sarah just launched a campaign you'd love"
  - Connection #2: "Mike is looking for marketing expertise for his SaaS - perfect timing for your consulting!"

**Important:** These "why connect" notes are what make it personal and valuable!

### Step 7: Generate & Copy
1. Click "Generate Connection Email"
2. Preview appears - check it looks good!
3. Click "Copy HTML to Clipboard"
4. Open Gmail, compose new email
5. Paste (Ctrl+V) - the formatting will come through!
6. Add your recipient's email address
7. Subject line idea: "Two people I think you should meet"
8. Send!

## Tips for Success

### Making Great Connections
- Look for **shared interests** (same industry, complementary skills)
- Look for **mutual benefit** (one needs what the other offers)
- Look for **similar goals** (both want to grow network in same area)

### Email Tone
- Keep it warm and personal
- Explain the WHY clearly
- Give them an easy out: "reply and let me know!"
- Don't force it - let them decide

### Workflow for 13 Users
- Monday morning: Open your sheet
- Scan through all 13 profiles
- Identify natural pairs
- Generate 2 connection emails per person (26 total connections)
- This creates ~6-7 emails to send
- Send them spread throughout Monday/Tuesday
- Track who you've connected in a simple note

### Save Time
The tool remembers your field selections, so you only need to:
1. Paste data once at the start
2. Select person + 2 connections
3. Write why connect (30 seconds)
4. Generate & copy
5. Paste in Gmail & send

Should take ~2 minutes per email once you know the profiles!

## Customization

### Change the Colors
The tool uses BudE's purple gradient. To change:
1. Right-click the HTML file → "Edit with Notepad"
2. Find `#667eea` and `#764ba2` (BudE purple colors)
3. Replace with your brand colors
4. Save

### Change the Signature
Look for this section in the HTML:
```html
Best,<br>
Kristina<br>
<span style="color: #667eea; font-weight: 600;">Networking BudE</span>
```

Change "Kristina" to your name or remove it entirely.

## Troubleshooting

### "No valid user data found"
- Make sure you copied the DATA rows, not just the header row
- Make sure you copied from Google Sheets (not a text file)
- Check you have at least: First Name, Last Name, Email columns

### Email looks plain in Gmail
- Make sure you PASTED, not typed
- Gmail should automatically render the HTML
- If not, try: Compose → Format options → Rich text mode

### Names showing as "undefined undefined"
- Your column order might be different
- Check which columns have First Name and Last Name
- You may need to adjust the column numbers in Step 2 of the HTML file

### Want to change column mappings?
In the HTML file, look for this section:
```javascript
firstName: cols[1] || '',  // Column B = First Name
lastName: cols[2] || '',   // Column C = Last Name
email: cols[4] || '',      // Column E = Email
```

The numbers in `cols[X]` match your columns (0 = A, 1 = B, 2 = C, etc.)

## Advanced: Batch Processing

If you want to do all 13 users at once:
1. Create a spreadsheet tab called "Connections Plan"
2. Columns: Recipient, Connection 1, Connection 2, Why 1, Why 2
3. Fill it out for all 13 users
4. Use the tool to generate each one
5. Works great if you pre-plan all connections on Sunday night!

## Privacy Note

- This tool runs 100% in your browser
- No data is sent to any server
- Your user data never leaves your computer
- The HTML file can be used offline
- Safe to use with real user data

## Questions?

- The tool is in your `bude-app` folder
- File name: `connection-email-generator.html`
- Just double-click to use anytime
- No installation, no login, no account needed

---

**Last Updated:** October 18, 2025
**Purpose:** Beta test connection facilitation for Networking BudE
**Created by:** Claude Code Assistant
