// This Google Sheets script will post to a slack channel when a user submits data to a Google Forms Spreadsheet
// View the README for installation instructions. Don't forget to add the required slack information below.

// based on: https://github.com/markfguerra/google-forms-to-slack
// Source: https://github.com/CoderDanUK/google-forms-to-slack

/////////////////////////
// Begin customization //
/////////////////////////

// Alter this to match the incoming webhook url provided by Slack
const slackIncomingWebhookUrl = "";

// Include # for public channels, omit it for private channels
const postChannel = "";

const postIcon = ":mailbox_with_mail:";
const postUser = "Form Response";
const postColor = "#0000DD";

const messageFallback = "The attachment must be viewed as plain text.";
const spreadsheetUrl = SpreadsheetApp.getActiveSpreadsheet().getUrl();
const messagePretext = `A user submitted a response to the form. You may review the response below at ${spreadsheetUrl}`;

// add the title of any columns you wish not to include with the payload.
// e.g. const ignoredColumns = ["ignored1", "ignored2"];
const ignoredColumns = [];

///////////////////////
// End customization //
///////////////////////

// In the Script Editor, run initialize() at least once to make your code execute on form submit
function initialize() {
  ScriptApp.getProjectTriggers()
    .forEach((trigger) => ScriptApp.deleteTrigger(trigger));
  
  ScriptApp.newTrigger("submitValuesToSlack")
    .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
    .onFormSubmit()
    .create();
}

// Running the code in initialize() will cause this function to be triggered this on every Form Submit
function submitValuesToSlack(e) {

  const payload = {
    "channel": postChannel,
    "username": postUser,
    "icon_emoji": postIcon,
    "link_names": 1,
    "attachments": constructAttachments(e.values)
  };

  const options = {
    'method': 'post',
    'payload': JSON.stringify(payload)
  };

  const response = UrlFetchApp.fetch(slackIncomingWebhookUrl, options);
}

// https://api.slack.com/docs/message-attachments
const constructAttachments = function(values) {
  const fields = makeFields(values);

  const attachments = [{
    "fallback" : messageFallback,
    "pretext" : messagePretext,
    "mrkdwn_in" : ["pretext"],
    "color" : postColor,
    "fields" : fields
  }]

  return attachments;
}

const makeFields = function(values) {
   return getColumnNames()
    .filter((colName) => !ignoredColumns.includes(colName))
    .map((colName, i) => {
      return {
        title: colName, 
        value: values[i],
        short: false
      }
    });
}

const getColumnNames = function() {
  
  const sheet = SpreadsheetApp.getActiveSheet();

  const headerRow = sheet.getRange("1:1");
  
  return headerRow.getValues()[0];
}
