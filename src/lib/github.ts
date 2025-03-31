// import { db } from "@/server/db";
// import { Octokit } from "octokit";
// import { aISummariseCommit } from "./gemini";
// import axios from "axios";

// export const octokit = new Octokit({
//   auth: process.env.GITHUB_TOKEN,
// });

// const githubUrl = "https://github.com/docker/genai-stack";

// type Response = {
//   commitHash: string;
//   commitMessage: string;
//   commitAuthorName: string;
//   commitAuthorAvatar: string;
//   commitDate: string;
// };

// export const getCommitHashes = async (
//   githubUrl: string,
// ): Promise<Response[]> => {
//   const [owner, repo] = githubUrl.split("/").slice(-2);
//   if (!owner || !repo) {
//     throw new Error("Invalid GitHub URL");
//   }
//   const { data } = await octokit.rest.repos.listCommits({
//     owner,
//     repo,
//   });

//   const sortedCommits = data.sort(
//     (a: any, b: any) =>
//       new Date(b.commit.author.date).getTime() -
//       new Date(a.commit.author.date).getTime(),
//   ) as any[];

//   return sortedCommits.slice(0, 10).map((commit: any) => ({
//     commitHash: commit.sha as string,
//     commitMessage: commit.commit.message ?? "",
//     commitAuthorName: commit.commit?.author?.name ?? "",
//     commitAuthorAvatar: commit?.author?.avatar_url ?? "",
//     commitDate: commit.commit?.author?.date ?? "",
//   }));
// };
// export const pollCommits = async (projectId: string) => {
//   const { project, githubUrl } = await fetchProjectGithubUrl(projectId);
//   const commitHashes = await getCommitHashes(githubUrl);
//   const unporcessedCommits = await filterUnprocessedCommits(
//     projectId,
//     commitHashes,
//   );
//   const summaryResponses = await Promise.allSettled(
//     unporcessedCommits.map((commit) => {
//       return summariseCommit(githubUrl, commit.commitHash);
//     }),
//   );

//   summaryResponses.forEach((response, index) => {
//     if (response.status === "rejected") {
//       console.error(`Error processing commit ${index}:`, response.reason);
//     }
//   });
//   const summaries = summaryResponses.map((response) => {
//     if (response.status === "fulfilled") {
//       return response.value as string;
//     }
//     return "";
//   });

//   const commits = await db.commit.createMany({
//     data: summaries.map((summary, index) => {
//         console.log(`processing commit ${index}`);

//       return {
//         projectId,
//         commitHash: unporcessedCommits[index]?.commitHash,
//         commitMessage: unporcessedCommits[index]?.commitMessage,
//         commitAuthorName: unporcessedCommits[index]?.commitAuthorName,
//         commitAuthorAvatar: unporcessedCommits[index]?.commitAuthorAvatar,
//         commitDate: unporcessedCommits[index]?.commitDate,
//         summary,
//       };
//     }),
//   });
// return commits;

// };
// async function summariseCommit(githubUrl: string, commitHash: string) {
//   // Get the diff, then pass the diff into AI
//   const { data } = await axios.get(`${githubUrl}/commit/${commitHash}.diff`, {
//     headers: {
//       Accept: "application/vnd.github.v3.diff",
//     },
//   });

//   return (await aISummariseCommit(data)) || "";
// }

// async function fetchProjectGithubUrl(projectId: string) {
//   const project = await db.project.findUnique({
//     where: { id: projectId },
//     select: {
//       githubUrl: true,
//     },
//   });
//   if (!project?.githubUrl) {
//     throw new Error(`Project with ID ${projectId} not found`);
//   }
//   return { project, githubUrl: project?.githubUrl };
// }

// async function filterUnprocessedCommits(
//   projectId: string,
//   commitHashes: Response[],
// ) {
//   const processedCommits = await db.commit.findMany({
//     where: { projectId },
//   });

//   const unprocessedCommits = commitHashes.filter(
//     (commit) =>
//       !processedCommits.some(
//         (processedCommit) => processedCommit.commitHash === commit.commitHash,
//       ),
//   );

//   return unprocessedCommits;
// }
// await pollCommits("cm8vljsyo00001kipyufqfc4v").then(console.log);

// import { db } from "@/server/db";
// import { Octokit } from "octokit";
// import { throttling } from "@octokit/plugin-throttling";
// import { aISummariseCommit } from "./gemini";

// const ThrottledOctokit = Octokit.plugin(throttling);

// export const octokit = new ThrottledOctokit({
//   auth: process.env.GITHUB_TOKEN,
//   throttle: {
//     onRateLimit: (retryAfter, options) => {
//       console.warn(`Rate limit hit, retrying after ${retryAfter} seconds`);
//       return true; // Retry after the specified time
//     },
//     onSecondaryRateLimit: (retryAfter, options) => {
//       console.warn(`Secondary rate limit hit, retrying after ${retryAfter} seconds`);
//       return true; // Retry after the specified time
//     },
//   },
// });

// const githubUrl = "https://github.com/docker/genai-stack";

// type Response = {
//   commitHash: string;
//   commitMessage: string;
//   commitAuthorName: string;
//   commitAuthorAvatar: string;
//   commitDate: string;
// };

// export const getCommitHashes = async (githubUrl: string): Promise<Response[]> => {
//   const [owner, repo] = githubUrl.split("/").slice(-2);
//   if (!owner || !repo) {
//     throw new Error("Invalid GitHub URL");
//   }
//   const { data } = await octokit.rest.repos.listCommits({
//     owner,
//     repo,
//   });

//   const sortedCommits = data.sort(
//     (a: any, b: any) =>
//       new Date(b.commit.author.date).getTime() -
//       new Date(a.commit.author.date).getTime(),
//   ) as any[];

//   return sortedCommits.slice(0, 10).map((commit: any) => ({
//     commitHash: commit.sha as string,
//     commitMessage: commit.commit.message ?? "",
//     commitAuthorName: commit.commit?.author?.name ?? "",
//     commitAuthorAvatar: commit?.author?.avatar_url ?? "",
//     commitDate: commit.commit?.author?.date ?? "",
//   }));
// };

// export const pollCommits = async (projectId: string) => {
//   const { project, githubUrl } = await fetchProjectGithubUrl(projectId);
//   const commitHashes = await getCommitHashes(githubUrl);
//   const unprocessedCommits = await filterUnprocessedCommits(projectId, commitHashes);

//   const summaryResponses = await Promise.allSettled(
//     unprocessedCommits.map((commit) =>
//       summariseCommit(githubUrl, commit.commitHash).catch((error) => {
//         console.error(`Failed to summarize commit ${commit.commitHash}:`, error);
//         return ""; // Return empty string on failure to keep processing
//       })
//     )
//   );

//   const summaries = summaryResponses.map((response) =>
//     response.status === "fulfilled" ? (response.value as string) : ""
//   );

//   try {
//     const commits = await db.commit.createMany({
//       data: summaries.map((summary, index) => ({
//         projectId,
//         commitHash: unprocessedCommits[index]?.commitHash,
//         commitMessage: unprocessedCommits[index]?.commitMessage,
//         commitAuthorName: unprocessedCommits[index]?.commitAuthorName,
//         commitAuthorAvatar: unprocessedCommits[index]?.commitAuthorAvatar,
//         commitDate: unprocessedCommits[index]?.commitDate,
//         summary,
//       })),
//     });
//     console.log("Inserted commits:", commits);
//     return commits; // Return the result for downstream use if needed
//   } catch (error) {
//     console.error("Error inserting commits:", error);
//     throw error; // Re-throw to allow caller to handle
//   }
// };

// async function summariseCommit(githubUrl: string, commitHash: string) {
//   try {
//     const [owner, repo] = githubUrl.split("/").slice(-2);
//     if (!owner || !repo) {
//       throw new Error("Invalid GitHub URL");
//     }

//     const { data } = await octokit.rest.repos.getCommit({
//       owner,
//       repo,
//       ref: commitHash,
//       mediaType: {
//         format: "diff", // Fetch the diff directly
//       },
//     });

//     const diff = data as unknown as string; // Type assertion since Octokit doesn't type the diff format
//     return await aISummariseCommit(diff) || "";
//   } catch (error) {
//     console.error(`Error fetching commit diff for ${commitHash}:`, error);
//     throw new Error(`Failed to fetch commit diff for ${commitHash}`);
//   }
// }

// async function fetchProjectGithubUrl(projectId: string) {
//   const project = await db.project.findUnique({
//     where: { id: projectId },
//     select: {
//       githubUrl: true,
//     },
//   });
//   if (!project?.githubUrl) {
//     throw new Error(`Project with ID ${projectId} not found`);
//   }
//   return { project, githubUrl: project.githubUrl };
// }

// async function filterUnprocessedCommits(projectId: string, commitHashes: Response[]) {
//   const processedCommits = await db.commit.findMany({
//     where: { projectId },
//   });

//   return commitHashes.filter(
//     (commit) =>
//       !processedCommits.some(
//         (processedCommit) => processedCommit.commitHash === commit.commitHash
//       )
//   );
// }

// // await pollCommits("cm8vljsyo00001kipyufqfc4v").then(console.log);

import { db } from "@/server/db";
import { Octokit } from "octokit";
import { aISummariseCommit } from "./gemini";
import axios from "axios";

export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const githubUrl = "https://github.com/docker/genai-stack";

type Response = {
  commitHash: string;
  commitMessage: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: string;
};

export const getCommitHashes = async (
  githubUrl: string,
): Promise<Response[]> => {
  const [owner, repo] = githubUrl.split("/").slice(-2);
  if (!owner || !repo) {
    throw new Error("Invalid GitHub URL");
  }
  const { data } = await octokit.rest.repos.listCommits({
    owner,
    repo,
  });

  const sortedCommits = data.sort(
    (a: any, b: any) =>
      new Date(b.commit.author.date).getTime() -
      new Date(a.commit.author.date).getTime(),
  ) as any[];

  return sortedCommits.slice(0, 10).map((commit: any) => ({
    commitHash: commit.sha as string,
    commitMessage: commit.commit.message ?? "",
    commitAuthorName: commit.commit?.author?.name ?? "",
    commitAuthorAvatar: commit?.author?.avatar_url ?? "",
    commitDate: commit.commit?.author?.date ?? "",
  }));
};
export const pollCommits = async (projectId: string) => {
  const { project, githubUrl } = await fetchProjectGithubUrl(projectId);
  const commitHashes = await getCommitHashes(githubUrl);
  const unporcessedCommits = await filterUnprocessedCommits(
    projectId,
    commitHashes,
  );
  const summaryResponses = await Promise.allSettled(
    unporcessedCommits.map((commit) => {
      return summariseCommit(githubUrl, commit.commitHash);
    }),
  );

  summaryResponses.forEach((response, index) => {
    if (response.status === "rejected") {
      console.error(`Error processing commit ${index}:`, response.reason);
    }
  });
  const summaries = summaryResponses.map((response) => {
    if (response.status === "fulfilled") {
      return response.value as string;
    }
    return "";
  });

  const commits = await db.commit.createMany({
    data: summaries.map((summary, index) => {
      console.log(`processing commit ${index}`);

      return {
        projectId,
        commitHash: unporcessedCommits[index]?.commitHash,
        commitMessage: unporcessedCommits[index]?.commitMessage,
        commitAuthorName: unporcessedCommits[index]?.commitAuthorName,
        commitAuthorAvatar: unporcessedCommits[index]?.commitAuthorAvatar,
        commitDate: unporcessedCommits[index]?.commitDate,
        summary,
      };
    }),
  });
  return commits;
};
// async function summariseCommit(githubUrl: string, commitHash: string) {
//     try {
//       // Extract owner and repo from the URL
//       const [owner, repo] = githubUrl.split("/").slice(-2);
//       if (!owner || !repo) {
//         throw new Error("Invalid GitHub URL");
//       }

//       // Construct the proper GitHub API URL
//       const apiUrl = `https://api.github.com/repos/${owner}/${repo}/commits/${commitHash}`;

//       // Get the diff with proper authentication
//       const { data } = await axios.get(apiUrl, {
//         headers: {
//           Accept: "application/vnd.github.v3.diff",
//           Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, // Add your token here
//         },
//       });

//       return (await aISummariseCommit(data)) || "";
//     } catch (error) {
//       console.error(`Error fetching commit diff for ${commitHash}:`, error);
//       throw new Error(`Failed to fetch commit diff for ${commitHash}`);
//     }
//   }

async function summariseCommit(githubUrl: string, commitHash: string) {
  const [owner, repo] = githubUrl.split("/").slice(-2);
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/commits/${commitHash}`;

  const { data } = await axios.get(apiUrl, {
    headers: {
      Accept: "application/vnd.github.v3.diff",
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    },
  });

  return aISummariseCommit(data) || "";
}

//below one is also working but not using it and above one is also working
// async function summariseCommit(githubUrl: string, commitHash: string) {

//   try {
//     const [owner, repo] = githubUrl.split("/").slice(-2);
//     if (!owner || !repo) {
//       throw new Error("Invalid GitHub URL");
//     }

//     const { data } = await octokit.rest.repos.getCommit({
//       owner,
//       repo,
//       ref: commitHash,
//       mediaType: {
//         format: "diff", // Fetch the diff directly
//       },
//     });

//     const diff = data as unknown as string; // Type assertion since Octokit doesn't type the diff format
//     return await aISummariseCommit(diff) || "";
//   } catch (error) {
//     console.error(`Error fetching commit diff for ${commitHash}:`, error);
//     throw new Error(`Failed to fetch commit diff for ${commitHash}`);
//   }
// }

async function fetchProjectGithubUrl(projectId: string) {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: {
      githubUrl: true,
    },
  });
  if (!project?.githubUrl) {
    throw new Error(`Project with ID ${projectId} not found`);
  }
  return { project, githubUrl: project?.githubUrl };
}

async function filterUnprocessedCommits(
  projectId: string,
  commitHashes: Response[],
) {
  const processedCommits = await db.commit.findMany({
    where: { projectId },
  });

  const unprocessedCommits = commitHashes.filter(
    (commit) =>
      !processedCommits.some(
        (processedCommit) => processedCommit.commitHash === commit.commitHash,
      ),
  );

  return unprocessedCommits;
}
