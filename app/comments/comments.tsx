import { useEffect } from 'react';
import { Form, useActionData, useLoaderData, useNavigate } from '@remix-run/react';
import { json } from '@remix-run/cloudflare';
import keys from '../turnstile/keys.json';

interface ActionData {
  success?: boolean;
  errors?: {
    name?: string;
    comment?: string;
  };
}

interface Comment {
  name: string;
  comment: string;
  timestamp: string;
}

interface LoaderData {
  comments: Comment[];
}

const AUTH_KEY_SECRET = keys.r2_auth_key;

export const loader = async () => {
  try {
    const response = await fetch('https://r2-worker.stephenjlu.com/comments.json', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Custom-Auth-Key': AUTH_KEY_SECRET
      }
    });
    
    const comments = (await response.json()) as Comment[];
    return json<LoaderData>({ comments });
  } catch (error) {
    return json<LoaderData>({ comments: [] });
  }
};

export const action = async ({ request }: { request: Request }) => {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const comment = formData.get('comment') as string;

    if (!name || !comment) {
      return json<ActionData>({
        success: false,
        errors: {
          name: !name ? 'Name is required' : undefined,
          comment: !comment ? 'Comment is required' : undefined,
        },
      });
    }

    const response = await fetch('https://r2-worker.stephenjlu.com/comments.json', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Custom-Auth-Key': AUTH_KEY_SECRET,
      },
      body: JSON.stringify({ name, comment, timestamp: new Date().toISOString() }),
    });

    if (!response.ok) throw new Error('Failed to save comment');
    return json<ActionData>({ success: true });
  } catch {
    return json<ActionData>({ success: false, errors: { comment: 'Failed to save comment' } });
  }
};

export default function Comments() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();
  const navigate = useNavigate();  

  useEffect(() => {
    if (actionData?.success) navigate('.', { replace: true });
  }, [actionData?.success, navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      padding: '6rem'
    }}>
      <h1>Comments</h1>
      <Form 
        method="post" 
        style={{ 
          marginTop: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          width: '100%',
          maxWidth: '500px'
        }}
      >
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          Name
          <input
            required
            name="name"
            type="text"
            maxLength={255}
            style={{
              padding: '0.5rem',
              borderRadius: '4px',
              border: actionData?.errors?.name ? '1px solid red' : '1px solid #ccc'
            }}
          />
        </label>
        
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          Comment
          <textarea
            required
            name="comment"
            maxLength={255}
            style={{
              padding: '0.5rem',
              borderRadius: '4px',
              border: actionData?.errors?.comment ? '1px solid red' : '1px solid #ccc',
              minHeight: '100px'
            }}
          />
        </label>

       <button 
          type="submit"
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            cursor: 'pointer',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          onFocus={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
          onBlur={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
        >
          Submit Comment
        </button>
      </Form>

      {actionData?.success && (
        <div style={{ marginTop: '1rem', color: 'green' }}>
          ✓ Comment submitted successfully
        </div>
      )}
      {actionData?.errors && (
        <div style={{ marginTop: '1rem', color: 'red' }}>
          ✗ {Object.values(actionData.errors).filter(Boolean).join(', ')}
        </div>
      )}

      <div style={{ 
        marginTop: '2rem',
        width: '100%',
        maxWidth: '500px'
      }}>
        <h2>Comments ({loaderData.comments.length})</h2>
        <div style={{ marginTop: '1rem' }}>
          {loaderData.comments.length === 0 ? (
            <div>No comments yet!</div>
          ) : (
            loaderData.comments.map((comment, index) => (
              <div 
                key={index} 
                style={{
                  padding: '1rem',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  marginBottom: '1rem'
                }}
              >
                <strong>{comment.name}</strong>
                <p style={{ margin: '0.5rem 0' }}>{comment.comment}</p>
                <small style={{ color: '#666' }}>
                  {new Date(comment.timestamp).toLocaleString()}
                </small>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}