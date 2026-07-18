export default function CheckEmailPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-57px)] max-w-sm flex-col justify-center gap-4 p-6 text-center">
      <p className="text-4xl">📬</p>
      <h1 className="text-2xl font-semibold">Check your email</h1>
      <p className="text-sm text-muted">
        We sent you a confirmation link. Click it to activate your account, then log in.
      </p>
    </main>
  );
}
