export default function InputRegister({ type, placeholder, onChange }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      required
      onChange={onChange}
      className="bg-zinc-800 text-zinc-100 placeholder-zinc-400 px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 transition"
    />
  );
}
