export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-10 py-6 border-b border-slate-800">
      <h1 className="text-3xl font-bold text-cyan-400">
        Calixo
      </h1>

      <div className="flex gap-8 text-gray-300">
        <a href="#">Home</a>
        <a href="#">Modules</a>
        <a href="#">Pricing</a>
        <a href="#">Contact</a>
      </div>
    </nav>
  );
}