import { useEffect, useState } from 'react';
import keys from './keys.json';

declare global {
  interface Window {
  /* 
  Possible Turnstile functions, per Cloudflare documentation
  */ 
  turnstile: {
    render: (selector: string | HTMLElement, options: { sitekey: string; theme?: string }) => string;
    reset: (widgetId?: string) => void;
    remove: (widgetId?: string) => void;
  };
}
}

type TurnstileTheme = 'light' | 'dark' | 'auto';

interface TurnstileProps {  
  className?: string;
  onWidgetId?: (id: string) => void;
  success: boolean;
  theme?: TurnstileTheme;  
  [key: string]: unknown; // Allow additional props
}

/* 
    A[Component Mounts] --> B[Create Script Tag]
    B --> C[Load Turnstile API]
    C --> D[Render Widget]
    D --> E[Return Widget ID]
    E --> F[Call onWidgetId]
    A --> G[Component Unmounts]
    G --> H[Remove Script]
    H --> I[Remove Widget] 
*/

export const Turnstile = ({ className, onWidgetId, success, theme, ...rest }: TurnstileProps) => {
  const [widgetId, setWidgetId] = useState<string>();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.defer = true;
    script.async = true;
    script.onload = () => {
      const id = window.turnstile.render('#cf-turnstile', {
        sitekey: `${keys.cft_public_key}`,
        theme: `${theme}`
      });
       setWidgetId(id);
      if (onWidgetId) onWidgetId(id);
    };
    document.head.appendChild(script);
    return () => {     
      document.head.removeChild(script);
    };
  }, [onWidgetId, theme]);

  /* Remove Turnstile widget after successful submission */
  useEffect(() => {
    if (success && widgetId && window.turnstile) {
      window.turnstile.remove(widgetId);
    }
  }, [success, widgetId]);

  /* Explicit render of Turnstile widget */
  
  return (
    <div
    id="cf-turnstile"
     className={className}     
      {...rest}      
    />
  );
};