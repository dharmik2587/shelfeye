import { AuthGate } from "@/components/shelfeye/auth-gate";
import { ShelfEyeApp } from "@/components/shelfeye/shelfeye-app";

export default function ShelfEyeWorkspacePage() {
  return (
    <AuthGate>
      <ShelfEyeApp />
    </AuthGate>
  );
}
