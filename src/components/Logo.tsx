import logoUrl from "../../logo/Sans titre.png";

interface LogoProps {
  className?: string;
}

export function Logo({ className = "" }: LogoProps) {
  return (
    <div className={`logo-crop ${className}`}>
      <img src={logoUrl} alt="README Studio" draggable={false} />
    </div>
  );
}
