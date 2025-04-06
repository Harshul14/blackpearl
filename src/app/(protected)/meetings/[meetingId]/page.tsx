import React from "react";
import IssuesList from "./issues-list";

type Props = {
  params: { meetingId: string };
};

const MeetingDetailsPage = async ({ params }: Props) => {
  const { meetingId } = params;
  return <IssuesList meetingId={meetingId} />;
};

export default MeetingDetailsPage;
