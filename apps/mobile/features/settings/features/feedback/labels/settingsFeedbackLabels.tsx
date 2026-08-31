import { fbs } from "fbtee";

export function SettingsFeedbackSectionTitle() {
  return <fbt desc="Settings section: send us feedback">Feedback</fbt>;
}

export function SettingsFeedbackSheetDescription() {
  return (
    <fbt desc="Feedback sheet: explain how feedback is used and response time">
      Use feedback to tell us how you feel about the app. You can also report
      bugs through here. You should get a response within one business day.
    </fbt>
  );
}

export function settingsFeedbackBugReportLabel() {
  return fbs("Send a bug report", "Settings feedback row: bug report");
}

export function settingsFeedbackGeneralLabel() {
  return fbs("Send Feedback", "Settings feedback row: general feedback");
}

export function settingsFeedbackFeatureIdeaLabel() {
  return fbs("Feature idea", "Settings feedback row: feature idea");
}

export function settingsFeedbackMailSubjectBugReport() {
  return fbs("Bug report", "Email subject for a bug report");
}

export function settingsFeedbackMailSubjectFeedback() {
  return fbs("Feedback for MindChart", "Email subject for general feedback");
}

export function settingsFeedbackMailSubjectFeatureIdea() {
  return fbs("Feature idea", "Email subject for a feature idea");
}

export function settingsFeedbackMailUnavailableAlertTitle() {
  return fbs(
    "Mail app unavailable",
    "Alert title when no mail app can be opened"
  );
}

export function settingsFeedbackMailUnavailableAlertMessage() {
  return fbs(
    "Could not open your mail app. Check that an email account is set up on this device.",
    "Alert message when no mail app can be opened"
  );
}
