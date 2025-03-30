// import { SidebarProvider } from "@/components/ui/sidebar";
// import { UserButton } from "@clerk/nextjs";
// import React from "react";
// import { AppSideBar } from "./app-sidebar";
// type Props = {
//   children: React.ReactNode;
// };
// const SidebarLayout = ({ children }: Props) => {
//   return (
//     <SidebarProvider>
//       {/* AppSideBar */}
//       <AppSideBar />
//       <main className="w-full m-2">
//         <div className="border-sidebar-border bg-sidebar flex items-center gap-2 rounded-md border p-2 px-4 shadow">
//           {/* SearchBar */}
//           <div className="m1-auto"></div>
//           <UserButton/>
//         </div>
//         <div className="h-4"></div>
//         <div className="border-sidebar-border bg-sidebar border shadow rounded-md overflow-y-scroll h-[calc(100vh - 6rem)] p-4">
//             {children}
//         </div>
//       </main>
//     </SidebarProvider>
//   );
// };

// export default SidebarLayout;

import { SidebarProvider } from "@/components/ui/sidebar";
import { UserButton } from "@clerk/nextjs";
import React from "react";
import { AppSideBar } from "./app-sidebar";

type Props = {
  children: React.ReactNode;
};

const SidebarLayout = ({ children }: Props) => {
  return (
    <SidebarProvider>
      {/* AppSideBar */}
      <AppSideBar />
      <main className="w-full">
        <div className="border-sidebar-border bg-sidebar m-2 flex items-center gap-2 rounded-md border p-2 px-4 shadow">
          {/* SearchBar */}
          <div className="ml-auto"></div>
          <UserButton />
        </div>
        <div className="border-sidebar-border bg-sidebar m-2 h-[calc(100vh-5rem)] overflow-y-auto rounded-md border p-4 shadow">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
};

export default SidebarLayout;
