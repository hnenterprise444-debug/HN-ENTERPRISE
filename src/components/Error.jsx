function ErrorState({ message }) {
  return (
    <main className="max-w-[1280px] mx-auto px-4 md:px-[40px] py-24 text-center">
      <span className="material-symbols-outlined text-6xl text-gray-300">error_outline</span>
      <p className="mt-4 text-xl font-semibold text-gray-600">{message}</p>
    </main>
  );
}

export default ErrorState;