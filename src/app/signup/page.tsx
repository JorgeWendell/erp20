import Image from "next/image";
import { Suspense } from "react";
import { SignupForm } from "./components/signup-form";

function SignupFormWrapper() {
  return <SignupForm />;
}

export default function SignupPage() {
  return (
    <div className="relative flex min-h-screen dark">
      <div className="absolute inset-0 scale-100">
        <Image
          src="/screen.png"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
      </div>
      <div className="relative z-10 flex w-full items-center justify-center p-8">
        <Suspense fallback={<div className="text-white">Carregando...</div>}>
          <SignupFormWrapper />
        </Suspense>
      </div>
    </div>
  );
}
