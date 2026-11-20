import { ResetForm } from "@/components/AuthForms";

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <>
      <h1>Ustaw nowe hasło</h1>
      <ResetForm token={token} />
    </>
  );
}
