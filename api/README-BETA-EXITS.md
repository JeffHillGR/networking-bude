# Beta Exit Tracking Setup

## Overview
The `/api/leaveBeta` endpoint logs when users leave the beta program to Google Sheets and can trigger email notifications.

## Google Sheet Setup

### 1. Add a "Beta_Exits" Tab to Your Google Sheet

In the same Google Sheet you're using for event suggestions, add a new tab called **Beta_Exits** (exact name, case-sensitive).

### 2. Set Up Column Headers

Add these headers in Row 1:

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| Timestamp | First Name | Last Name | Email | Job Title | Company |

### 3. (Optional) Set Up Email Notifications

**Option A: Google Sheets Email Notifications**
1. Go to **Extensions > Apps Script**
2. Add this code:
```javascript
function onEdit(e) {
  var sheet = e.source.getActiveSheet();

  // Only trigger for Beta_Exits tab
  if (sheet.getName() === "Beta_Exits") {
    var row = e.range.getRow();

    // Get the data from the new row
    var data = sheet.getRange(row, 1, 1, 6).getValues()[0];
    var timestamp = data[0];
    var firstName = data[1];
    var lastName = data[2];
    var email = data[3];
    var jobTitle = data[4];
    var company = data[5];

    // Send email to yourself
    MailApp.sendEmail({
      to: "grjeff@gmail.com",
      subject: "🚨 BudE Beta Exit - " + firstName + " " + lastName,
      body: "A user has left the BudE beta program:\n\n" +
            "Name: " + firstName + " " + lastName + "\n" +
            "Email: " + email + "\n" +
            "Job Title: " + jobTitle + "\n" +
            "Company: " + company + "\n" +
            "Left At: " + timestamp + "\n\n" +
            "View the full sheet: " + e.source.getUrl()
    });
  }
}
```
3. Save the script
4. Click **Run** > **onEdit** to authorize
5. Now you'll get an email whenever someone leaves beta!

**Option B: Google Sheets Notification Rules**
1. Click **Tools > Notification rules**
2. Set up a rule: "Notify me when... Changes are made"
3. Choose email frequency (immediately recommended)

### 4. Data Columns Explained

- **Timestamp**: When the user clicked "Leave Beta"
- **First Name**: User's first name from their profile
- **Last Name**: User's last name from their profile
- **Email**: User's email address
- **Job Title**: User's job title
- **Company**: User's company name

## Testing

To test the endpoint locally:

```bash
curl -X POST http://localhost:5173/api/leaveBeta \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "jobTitle": "Product Manager",
    "company": "Test Corp",
    "leftAt": "2025-01-15T10:30:00.000Z"
  }'
```

## Monitoring

You can view all beta exits in real-time in your Google Sheet at:
- Tab: **Beta_Exits**
- Sort by Timestamp to see most recent exits first

## Privacy Note

This data is collected to help you understand:
- Who is testing your product
- Why people might be leaving
- Churn patterns during beta

Make sure this aligns with your privacy policy and terms of service.
