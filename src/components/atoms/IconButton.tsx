import type { LucideIcon } from 'lucide-react';

interface IconButtonProps {
  icon: LucideIcon;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
}

export const IconButton = ({
  icon: Icon,
  onClick,
  variant = 'secondary',
  size = 'md',
  disabled = false,
  ariaLabel,
  className = '',
}: IconButtonProps) => {
  const baseStyles = 'rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-white focus:ring-gray-500 disabled:bg-gray-800 disabled:cursor-not-allowed',
    ghost: 'bg-transparent hover:bg-gray-700 text-white focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed',
  };

  const sizeStyles = {
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      <Icon size={iconSizes[size]} />
    </button>
  );
};
