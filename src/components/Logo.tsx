/** Logo del toro (sello circular). */
export function Logo({ size = 56, className = '' }: { size?: number; className?: string }) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}logo.png`}
      alt=""
      width={size}
      height={size}
      className={`rounded-full bg-tinta ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
