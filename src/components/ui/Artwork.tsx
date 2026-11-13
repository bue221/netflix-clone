import { useState, type ImgHTMLAttributes } from 'react';
import styles from './Artwork.module.css';

interface ArtworkProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string | null;
  /** Text shown on the placeholder when the image is missing or fails to load. */
  fallbackLabel: string;
}

/** Image that fades in once decoded and degrades to a labelled placeholder on error. */
export function Artwork({ src, fallbackLabel, className, alt, loading = 'lazy', ...props }: ArtworkProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [prevSrc, setPrevSrc] = useState(src);

  if (src !== prevSrc) {
    setPrevSrc(src);
    setStatus('loading');
  }

  if (!src || status === 'error') {
    return (
      <div className={`${styles.fallback} ${className ?? ''}`} role="img" aria-label={alt}>
        <span>{fallbackLabel}</span>
      </div>
    );
  }

  return (
    <img
      {...props}
      ref={(node) => {
        if (node?.complete && node.naturalWidth > 0) setStatus('loaded');
      }}
      src={src}
      alt={alt}
      loading={loading}
      decoding="async"
      className={`${styles.image} ${status === 'loaded' ? styles.loaded : ''} ${className ?? ''}`}
      onLoad={() => setStatus('loaded')}
      onError={() => setStatus('error')}
    />
  );
}
