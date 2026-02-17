import type { ReactNode, MouseEventHandler } from 'react';

interface IconButtonProps {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  'aria-label'?: string;
  badge?: number | string;
}

export const IconButton = ({
  children,
  onClick,
  variant = 'glass',
  size = 'md',
  disabled = false,
  type = 'button',
  className = '',
  'aria-label': ariaLabel,
  badge,
}: IconButtonProps) => {
  const baseStyles = `
    relative rounded-full
    flex items-center justify-center
    transition-all duration-150 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0a0a]
    active:scale-95 active:transition-transform
    disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
    select-none touch-manipulation
  `;

  const variantStyles: Record<string, string> = {
    primary: `
      bg-gradient-to-br from-primary-500 to-primary-600
      text-white shadow-lg shadow-primary-500/25
      hover:shadow-xl hover:shadow-primary-500/35
      focus:ring-primary-500
    `,
    secondary: `
      bg-gray-800/50 backdrop-blur-sm
      text-white border border-gray-700
      shadow-md
      hover:bg-gray-700/50
      focus:ring-gray-500
    `,
    danger: `
      bg-gradient-to-br from-red-500 to-red-600
      text-white shadow-lg shadow-red-500/25
      hover:shadow-xl hover:shadow-red-500/35
      focus:ring-red-500
    `,
    ghost: `
      bg-transparent text-gray-300
      hover:bg-white/10 hover:text-white
      focus:ring-gray-500
    `,
    glass: `
      bg-white/10 backdrop-blur-sm
      text-white
      hover:bg-white/20
      focus:ring-gray-400
    `,
  };

  const sizeStyles: Record<string, string> = {
    sm: 'w-11 h-11 [&_svg]:w-5 [&_svg]:h-5',
    md: 'w-14 h-14 [&_svg]:w-6 [&_svg]:h-6',
    lg: 'w-16 h-16 [&_svg]:w-8 [&_svg]:h-8',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      aria-label={ariaLabel}
    >
      {children}
      {badge != null && (
        <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1 bg-primary-500 rounded-full text-xs flex items-center justify-center font-medium">
          {typeof badge === 'number' && badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );
};
