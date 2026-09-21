export default function Logo({ className = "" }) {
  return (
    <img
      src="/images/logo-png.png"
      alt="Café Kiaan"
      className={`h-28 w-auto object-contain ${className}`}
    />
  );
}
