import { View } from "react-native";
import { useBottomSheetModal } from "@gorhom/bottom-sheet";
import ListItem from "@/components/ui/list-item";
import { Button, Typography } from "@/components/ui";
import { Icon } from "@/components/ui/icons/icon";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetOpenTrigger,
  BottomSheetView,
} from "@/components/primitives/bottomSheet/bottom-sheet.native";
import { SettingsSection } from "@/features/settings/components/settingsSection";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import { openFeedbackMail } from "../services/openFeedbackMail";
import {
  SettingsFeedbackSectionTitle,
  SettingsFeedbackSheetDescription,
  settingsFeedbackBugReportLabel,
  settingsFeedbackFeatureIdeaLabel,
  settingsFeedbackGeneralLabel,
  settingsFeedbackMailSubjectBugReport,
  settingsFeedbackMailSubjectFeatureIdea,
  settingsFeedbackMailSubjectFeedback,
} from "../labels/settingsFeedbackLabels";

function FeedbackSheetBody() {
  const { dismiss } = useBottomSheetModal();

  const openMail = (subject: string) => {
    dismiss();
    void openFeedbackMail(subject);
  };

  return (
    <BottomSheetView className="flex-1 bg-background px-4 pb-8">
      <View className="flex-1 justify-between">
        <View className="gap-3">
          <View className="flex-row items-center gap-2">
            <Icon
              name="message-circle-question-mark"
              color="foreground"
              size={22}
            />
            <Typography variant="h3" padding={false}>
              <SettingsFeedbackSectionTitle />
            </Typography>
          </View>
          <Typography variant="p" className="text-muted-foreground">
            <SettingsFeedbackSheetDescription />
          </Typography>
        </View>
        <View className="items-end gap-1 pt-4">
          <Button
            variant="ghost"
            size="sm"
            onPress={() =>
              openMail(String(settingsFeedbackMailSubjectBugReport()))
            }
          >
            <Typography>{settingsFeedbackBugReportLabel()}</Typography>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onPress={() =>
              openMail(String(settingsFeedbackMailSubjectFeedback()))
            }
          >
            <Typography>{settingsFeedbackGeneralLabel()}</Typography>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onPress={() =>
              openMail(String(settingsFeedbackMailSubjectFeatureIdea()))
            }
          >
            <Typography>{settingsFeedbackFeatureIdeaLabel()}</Typography>
          </Button>
        </View>
      </View>
    </BottomSheetView>
  );
}

export function FeedbackSettingsSection() {
  const { colorScheme } = useColorScheme();

  return (
    <SettingsSection
      title={<SettingsFeedbackSectionTitle />}
      icon="message-circle-question-mark"
    >
      <BottomSheet>
        <BottomSheetOpenTrigger asChild>
          <ListItem
            label={settingsFeedbackGeneralLabel()}
            borderBottom={false}
          />
        </BottomSheetOpenTrigger>
        <BottomSheetContent
          enableDynamicSizing={false}
          snapPoints={["45%"]}
          backgroundStyle={{ backgroundColor: hsl("background", colorScheme) }}
        >
          <BottomSheetHeader className="bg-background" />
          <FeedbackSheetBody />
        </BottomSheetContent>
      </BottomSheet>
    </SettingsSection>
  );
}
