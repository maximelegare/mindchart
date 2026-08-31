import ListItem from "@/components/ui/list-item";
import { SettingsSection } from "@/features/settings/components/settingsSection";
import { openFeedbackMail } from "../services/openFeedbackMail";
import {
  SettingsFeedbackSectionTitle,
  settingsFeedbackBugReportLabel,
  settingsFeedbackFeatureIdeaLabel,
  settingsFeedbackGeneralLabel,
  settingsFeedbackMailSubjectBugReport,
  settingsFeedbackMailSubjectFeatureIdea,
  settingsFeedbackMailSubjectFeedback,
} from "../labels/settingsFeedbackLabels";

export function FeedbackSettingsSection() {
  return (
    <SettingsSection title={<SettingsFeedbackSectionTitle />} icon="headset">
      <ListItem
        label={settingsFeedbackBugReportLabel()}
        onPress={() =>
          openFeedbackMail(String(settingsFeedbackMailSubjectBugReport()))
        }
      />
      <ListItem
        label={settingsFeedbackGeneralLabel()}
        onPress={() =>
          openFeedbackMail(String(settingsFeedbackMailSubjectFeedback()))
        }
      />
      <ListItem
        label={settingsFeedbackFeatureIdeaLabel()}
        borderBottom={false}
        onPress={() =>
          openFeedbackMail(String(settingsFeedbackMailSubjectFeatureIdea()))
        }
      />
    </SettingsSection>
  );
}
