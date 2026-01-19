/**
 * White Angus Woodworks - Email Relay Script
 * 
 * INSTRUCTIONS:
 * 1. Go to https://script.google.com/ and create a "New Project".
 * 2. Delete the default code and paste this entire script.
 * 3. Replace the 'recipient' email below with your email: zacharyharlan@gmail.com
 * 4. Click 'Deploy' -> 'New Deployment'.
 * 5. Select type: 'Web App'.
 * 6. Set 'Execute as': 'Me'.
 * 7. Set 'Who has access': 'Anyone'.
 * 8. Click 'Deploy'. You may need to authorize the script to send emails.
 * 9. Copy the 'Web App URL' and paste it into script.js in your project.
 */

function doPost(e) {
  var recipient = "zacharyharlan@gmail.com";
  var subject = "New Woodworking Quote Request: " + (e.parameter.name || "Unknown");
  
  // Format the email body
  var body = "You have received a new quote request from your website.\n\n" +
             "--------------------------------------------------\n" +
             "Name: " + (e.parameter.name || "Not provided") + "\n" +
             "Email: " + (e.parameter.email || "Not provided") + "\n" +
             "Project Type: " + (e.parameter['project-type'] || "Not provided") + "\n" +
             "Message: " + (e.parameter.message || "Not provided") + "\n" +
             "--------------------------------------------------\n\n" +
             "Timestamp: " + new Date().toLocaleString();

  try {
    MailApp.sendEmail({
      to: recipient,
      subject: subject,
      replyTo: e.parameter.email,
      body: body
    });
    
    return ContentService.createTextOutput(JSON.stringify({"result": "success"}))
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({"result": "error", "message": error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle pre-flight OPTIONS request if browser checks CORS
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}
