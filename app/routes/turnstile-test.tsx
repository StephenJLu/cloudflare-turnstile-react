import { useState } from 'react';
import { Turnstile } from '~/turnstile/turnstile';
import { verifyTurnstileToken } from '~/utils/turnstile';
import { Form } from '@remix-run/react';
import Comments from '~/comments/comments';

export const TurnstileTest = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showComments, setShowComments] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('loading');
    setErrorMessage('');
    
    const formData = new FormData(event.currentTarget);
    const token = formData.get('cf-turnstile-response') as string;
    
    try {
      const result = await verifyTurnstileToken(token);
      if ('success' in result && result.success) {
        setStatus('success');
        setShowComments(true);
      } else {
        setStatus('error');
        if ('message' in result) {
          setErrorMessage(result.message || 'Verification failed');
        } else {
          setErrorMessage('Verification failed');
        }
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('Verification failed');
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      padding: '6rem'
    }}>
      <h1>Protected Comments</h1>
      {!showComments && (
        <Form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
          <Turnstile
            theme="dark"          
            style={{ marginBottom: '1rem' }}
            success={status === 'success'}
          />
          <button 
            type="submit"
            style={{
              padding: '0.5rem 1rem',
              fontSize: '1rem',
              cursor: 'pointer',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            Verify Turnstile to Reveal Comments
          </button>
        </Form>
      )}
      
      {status === 'loading' && (
        <div style={{ marginTop: '1rem', color: 'blue' }}>
          Verifying...
        </div>
      )}
      
      {status === 'error' && (
        <div style={{ marginTop: '1rem', color: 'red' }}>
          ✗ {errorMessage}
        </div>
      )}

      {showComments && <Comments />}
    </div>
  );
}