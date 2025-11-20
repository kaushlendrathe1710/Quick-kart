export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-200">404</h1>
        <p className="mt-4 text-2xl font-semibold text-gray-800">Page Not Found</p>
        <p className="mt-2 text-gray-600">The page you're looking for doesn't exist.</p>
        <a
          href="/"
          className="mt-6 inline-block rounded-md bg-primary px-6 py-3 text-primary-foreground hover:bg-[hsl(var(--primary)/0.9)]"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
