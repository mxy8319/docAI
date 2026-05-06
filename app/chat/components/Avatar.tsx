interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg";
}

export function Avatar({ src, name, size = "md" }: AvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name || "用户头像"}
        className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-surface-container`}
      />
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-surface-container flex items-center justify-center`}>
      <svg className={`${iconSizes[size]} text-on-surface-variant`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    </div>
  );
}
