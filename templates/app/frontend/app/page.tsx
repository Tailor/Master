// Home page (Server Component). Fetches the backend /health endpoint to prove the
// full stack is wired together. Edit this file at frontend/app/page.tsx.
import { api } from './lib/api';

interface Health {
  ok: boolean;
  service: string;
  time: string;
}

export default async function Home() {
  let health: Health | null = null;
  let error: string | null = null;

  try {
    health = await api<Health>('/health');
  } catch (err) {
    error = (err as Error).message;
  }

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '4rem 1.5rem' }}>
      <h1 style={{ fontSize: '2.75rem', marginBottom: '0.25rem' }}>⚡ Master</h1>
      <p style={{ color: '#9a9ab0', marginTop: 0 }}>
        Next.js frontend · MasterController API · MasterRecord ORM
      </p>

      <section
        style={{
          marginTop: '2rem',
          padding: '1.25rem 1.5rem',
          borderRadius: 12,
          background: health?.ok ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
          border: `1px solid ${health?.ok ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
        }}
      >
        {health?.ok ? (
          <>
            <strong>Backend connected.</strong> The API answered{' '}
            <code>/health</code> at {new Date(health.time).toLocaleTimeString()}.
          </>
        ) : (
          <>
            <strong>Backend not reachable.</strong> Run <code>master dev</code> to start it.
            {error ? <div style={{ marginTop: 8, color: '#f4a8a8' }}>{error}</div> : null}
          </>
        )}
      </section>

      <h2 style={{ marginTop: '2.5rem' }}>Next steps</h2>
      <ol style={{ lineHeight: 1.9, color: '#c8c8da' }}>
        <li>
          Scaffold a resource: <code>master generate scaffold post title:string body:text</code>
        </li>
        <li>
          Run migrations: <code>master db new PostInit</code> then <code>master db migrate</code>
        </li>
        <li>Visit the generated page and build something powerful.</li>
      </ol>

      <p style={{ marginTop: '3rem', color: '#6b6b82', fontSize: '0.9rem' }}>
        By the power of Grayskull.
      </p>
    </main>
  );
}
