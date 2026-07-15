const ErrorFallback = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-admin-primary text-white">
      <h2 className="text-2xl font-bold mb-4">Oops! Something went wrong.</h2>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-admin-secondary rounded hover:opacity-80 transition"
      >
        Reload page
      </button>
    </div>
  );
};

export default ErrorFallback;
