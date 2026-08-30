import { useLocaleContext } from "@/features/translations/context/translations";
import { DEFAULT_LANGUAGE } from "@/features/translations/constants/lang";
import { toDateKey, UNDATED_GROUP_KEY } from "../utils/groupNotesByDate";

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const formatAbsoluteDateKey = (dateKey: string, locale: string) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  if (!year || !month || !day) return dateKey;
  return new Intl.DateTimeFormat(locale || DEFAULT_LANGUAGE, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
};

export function DateGroupLabel({ dateKey }: { dateKey: string }) {
  const { locale } = useLocaleContext();

  if (dateKey === UNDATED_GROUP_KEY) {
    return <fbt desc="Date group: no date">No date</fbt>;
  }

  const today = toDateKey(new Date());
  const yesterday = toDateKey(addDays(new Date(), -1));

  if (dateKey === today) {
    return <fbt desc="Date group: today">Today</fbt>;
  }

  if (dateKey === yesterday) {
    return <fbt desc="Date group: yesterday">Yesterday</fbt>;
  }

  return formatAbsoluteDateKey(dateKey, locale);
}
