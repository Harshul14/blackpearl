// import type { Project } from "@/app/types/project";
import { api } from "@/trpc/react";
import { useLocalStorage } from "usehooks-ts";
type Project = {
    id: string;
    name: string;
  };
  
const useProject = () => {
    const { data: projects } = api.project.getProjects.useQuery<Project[]>();
    const [projectId, setProjectId] = useLocalStorage(
      "blackpearl-project-id",
      "",
    );
    const project = projects?.find((p) => p.id === projectId);
    return { projects, project, projectId, setProjectId };
  };

export default useProject;
