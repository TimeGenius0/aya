import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div>
      <div className="mb-8 text-center">
        <p className="text-sm font-medium text-brand">Cabinet vétérinaire</p>
        <h1 className="mt-1 text-2xl font-semibold">Aya Handous</h1>
      </div>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
