import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  icon?: ReactNode;
}

export function Button({ variant = 'primary', icon, children, className, type = 'button', ...props }: ButtonProps) {
  return (
    <button type={type} className={`${styles.button} ${styles[variant]} ${className ?? ''}`} {...props}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <span>{children}</span>
    </button>
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: 'outline' | 'solid';
  children: ReactNode;
}

/** Round icon-only button used in previews and the details modal. */
export function IconButton({ label, variant = 'outline', children, className, type = 'button', ...props }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={`${styles.round} ${styles[variant]} ${className ?? ''}`}
      {...props}
    >
      {children}
    </button>
  );
}
