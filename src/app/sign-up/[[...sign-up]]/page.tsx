import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="text-foreground flex min-h-screen items-center justify-center bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a]">
      <div className="w-full max-w-md px-4 sm:px-6 lg:px-8">
        <div className="glassmorphism rounded-2xl p-6 shadow-xl">
          <SignUp />
        </div>
      </div>
    </div>
  );
}
