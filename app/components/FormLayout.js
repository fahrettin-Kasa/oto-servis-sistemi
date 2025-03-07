export default function FormLayout({ children, title }) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800/50 backdrop-blur-lg p-8 rounded-xl shadow-2xl border border-gray-700">
        <h1 className="text-2xl font-bold text-white text-center mb-8">
          {title}
        </h1>
        {children}
      </div>
    </div>
  );
}
