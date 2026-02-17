interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  className = '',
}: ButtonProps) => {
  const baseStyles = `
    font-semibold rounded-2xl inline-flex items-center justify-center gap-3 whitespace-nowrap shrink-0
    transition-all duration-150 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0a0a]
    active:scale-95 active:transition-transform
    disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
    select-none
    touch-manipulation
  `;

  const variantStyles = {
    primary: `
      bg-gradient-to-br from-primary-500 to-primary-600
      text-white shadow-lg shadow-primary-500/25
      hover:shadow-xl hover:shadow-primary-500/35
      focus:ring-primary-500
      dark:from-primary-400 dark:to-primary-500
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
  };

  const sizeStyles = {
    sm: 'min-h-[44px] px-4 py-2.5 text-sm',
    md: 'min-h-[52px] px-6 py-3 text-base',
    lg: 'min-h-[60px] px-8 py-4 text-lg',
    icon: 'min-h-[44px] min-w-[44px] p-3 aspect-square',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </button>
  );
};
