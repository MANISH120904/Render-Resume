export type MockResumeDraft = {
  id: string;
  title: string;
  template: string;
  templateLabel: string;
  lastEdited: string;
};

export const MOCK_DASHBOARD_DATA = {
  creditBalance: 0,
  downloadCredits: 0,
  resumes: [
    {
      id: "draft-1",
      title: "Frontend Engineer Resume",
      template: "minimal",
      templateLabel: "Minimal",
      lastEdited: "Jan 12",
    },
    {
      id: "draft-2",
      title: "Product Designer Resume",
      template: "compact",
      templateLabel: "Compact",
      lastEdited: "Jan 9",
    },
    {
      id: "draft-3",
      title: "Backend Resume",
      template: "modern",
      templateLabel: "Modern",
      lastEdited: "Jan 4",
    },
  ] satisfies MockResumeDraft[],
};
