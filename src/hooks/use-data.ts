import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getStudents } from "@/lib/sheets.functions";
import { getSchoolSettings } from "@/lib/settings.functions";

export function useSchoolSettings() {
  const fn = useServerFn(getSchoolSettings);
  return useQuery({
    queryKey: ["school_settings"],
    queryFn: () => fn({}),
  });
}

export function useStudents(spreadsheetId: string | null | undefined) {
  const fn = useServerFn(getStudents);
  return useQuery({
    queryKey: ["students", spreadsheetId],
    queryFn: () => fn({ data: { spreadsheetId: spreadsheetId! } }),
    enabled: !!spreadsheetId,
    staleTime: 5 * 60 * 1000,
  });
}
