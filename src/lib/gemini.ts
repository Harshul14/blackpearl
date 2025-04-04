import { GoogleGenerativeAI } from "@google/generative-ai"; // 19k (gzipped: 5.7k)
import { Document } from "@langchain/core/documents";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

export const aISummariseCommit = async (diff: string) => {
  // https://github.com/docker/genai-stack/commit/<commithash>.diff
  const response = await model.generateContent([
    `You are an expert programmer, and you are trying to summarize a git diff.
            Reminders about the git diff format:
            For every file, there are a few metadata lines, like (for example):
            \`\`\`
            diff --git a/lib/index.js b/lib/index.js
            index addf691..b7ef603 100644
            --- a/lib/index.js
            +++ b/lib/index.js
            \`\`\`
            This means that \`lib/index.js\` was modified in this commit. Note that this is only an example.
            Then there is a specifier of the lines that were modified.
            A line starting with \`+\` means it was added.
            A line that starting with \`-\` means that line was deleted.
            A line that starts with neither \`+\` nor \`-\` is code given for context and better understanding.
            It is not part of the diff.
            [...]
            EXAMPLE SUMMARY COMMENTS:
            \`\`\`
            * Raised the amount of returned recordings from \`10\` to \`100\` [packages/server/recordings_api.ts], [packages/server/constants.ts]
            * Fixed a typo in the github action name [.github/workflows/gpt-commit-summerizer.yml]
            * Moved the \`octokit\` initialization to a separate file [src/octokit.ts], [src/index.ts]
            * Added an OpenAI API for completions [packages/utils/apis/openai.ts]
            * Lowered numeric tolerance for test files
            \`\`\`
            Most commits will have less comments than this examples list.
            The last comment does not include the file names.
            Because there were more than two relevant files in the hypothetical commit.
            Do not include parts of the example in your summary.
            It is given only as an example of appropriate comments.`,
    `Please summarise the following diff file: \n\n${diff}`,
  ]);
  return response.response.text();
};


export async function summariseCode(doc: Document) {
  console.log("getting summary for", doc.metadata.source);
  const code = doc.pageContent.slice(0, 10000); // Limit to 10000 characters
  
  const response = await model.generateContent([
      `You are an intelligent senior software engineer who specialises in onboarding junior software engineers onto projects.
      You are onboarding a junior software engineer and explaining to them the purpose of the ${doc.metadata.source} file.
      Here is the code:
      ${code}
      Give a summary no more than 100 words of the code above`,
    ]);

  return response.response.text();
}

export async function generateEmbedding(summary: string) {
  const model = genAI.getGenerativeModel({
      model: "text-embedding-004"
  });
  const result = await model.embedContent(summary);
  const embedding=result.embedding;
  return embedding.values;
}

console.log(await generateEmbedding("Hello World!"));


// console.log(await aISummariseCommit(`diff --git a/src/app/(protected)/dashboard/page.tsx b/src/app/(protected)/dashboard/page.tsx
// index 160248c..8a52acd 100644
// --- a/src/app/(protected)/dashboard/page.tsx
// +++ b/src/app/(protected)/dashboard/page.tsx
// @@ -1,12 +1,44 @@
//  "use client";
// +import useProject from "@/hooks/use-project";
//  import { useUser } from "@clerk/nextjs";
// +import { ExternalLink, Github } from "lucide-react";
// +import Link from "next/link";

//  const DashboardPage = () => {
// -  const { user } = useUser();
// +  const { project } = useProject();
//    return (
//      <div>
// -      <div>{user?.firstName}</div>
// -      <div>{user?.lastName}</div>
// +      <div className="flex flex-wrap items-center justify-between gap-y-4">
// +        {/* Github Link */}
// +        <div className="bg-primary w-fit rounded-md px-4 py-3">
// +          <div className="flex items-center">
// +            <Github className="size-5 text-white" />
// +            <div className="ml-2">
// +              <p className="text-sm font-medium text-white">
// +                This project is linked to{" "}
// +                <Link
// +                  href={project?.githubUrl ?? ""}
// +                  className="inline-flex items-center text-white/80 hover:underline"
// +                >
// +                  {project?.githubUrl}
// +                  <ExternalLink className="ml-1 size-4" />
// +                </Link>
// +              </p>
// +            </div>
// +          </div>
// +        </div>
// +        <div className="h-4"></div>
// +        <div className="flex items-center gap-4">
// +          TeamMembers InviteButton ArchiveButton
// +        </div>
// +      </div>
// +      <div className="mt-4">
// +        <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
// +          AskQuestionsCard MeetingsCard
// +        </div>
// +        <div className="mt-8"></div>
// +        CommitLog
// +      </div>
//      </div>
//    );
//  };
// diff --git a/src/hooks/use-project.ts b/src/hooks/use-project.ts
// index 6d34e28..8e025ca 100644
// --- a/src/hooks/use-project.ts
// +++ b/src/hooks/use-project.ts
// @@ -1,19 +1,14 @@
// -// import type { Project } from "@/app/types/project";
//  import { api } from "@/trpc/react";
//  import { useLocalStorage } from "usehooks-ts";
// -type Project = {
// -    id: string;
// -    name: string;
// -  };
// -
// +
//  const useProject = () => {
// -    const { data: projects } = api.project.getProjects.useQuery<Project[]>();
// -    const [projectId, setProjectId] = useLocalStorage(
// -      "blackpearl-project-id",
// -      "",
// -    );
// -    const project = projects?.find((p) => p.id === projectId);
// -    return { projects, project, projectId, setProjectId };
// -  };
// +  const { data: projects } = api.project.getProjects.useQuery();
// +  const [projectId, setProjectId] = useLocalStorage(
// +    "blackpearl-project-id",
// +    "",
// +  );
// +  const project = projects?.find((project) => project.id === projectId);
// +  return { projects, project, projectId, setProjectId };
// +};

//  export default useProject;`));
