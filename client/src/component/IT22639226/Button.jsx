export function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
