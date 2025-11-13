import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">Vector Aligner</h1>
          <p className="text-muted-foreground mt-2">Streamlined interview pipeline for teams</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
