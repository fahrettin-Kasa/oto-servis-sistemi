export default function Button({
  children,
  type = "button",
  onClick,
  disabled = false,
  loading = false,
  className = "",
  variant = "primary",
}) {
  const baseStyles =
    "w-full py-2.5 rounded-lg text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700",
    danger: "bg-red-600 hover:bg-red-700",
    success: "bg-green-600 hover:bg-green-700",
    warning: "bg-yellow-600 hover:bg-yellow-700",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {loading ? "Yükleniyor..." : children}
    </button>
  );
}
