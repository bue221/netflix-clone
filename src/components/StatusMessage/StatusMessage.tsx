import type { ReactNode } from 'react';
import styles from './StatusMessage.module.css';

interface StatusMessageProps {
  heading: string;
  children?: ReactNode;
  action?: ReactNode;
  tone?: 'neutral' | 'error';
}

export function StatusMessage({ heading, children, action, tone = 'neutral' }: StatusMessageProps) {
  return (
    <div className={styles.status} role={tone === 'error' ? 'alert' : 'status'}>
      <h2>{heading}</h2>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}
