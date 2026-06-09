// The Master welcome page — shown when you first create an app (like the classic
// Rails welcome screen). Replace it with your own home page when you're ready:
// this file lives at frontend/app/page.tsx.
import { api } from './lib/api';

interface Health {
  ok: boolean;
  service: string;
  time: string;
}

const colors = {
  void: '#05060a',
  panel: 'rgba(19, 28, 48, 0.75)',
  edge: 'rgba(46, 139, 255, 0.25)',
  blue: '#2e8bff',
  cyan: '#22d3ee',
  energy: '#7fd33b',
  chrome: '#eaf2ff',
  steel: '#aebbd4',
  dim: '#6b7a99',
};

const card: React.CSSProperties = {
  background: colors.panel,
  border: `1px solid ${colors.edge}`,
  borderRadius: 14,
  padding: '1.25rem 1.5rem',
  backdropFilter: 'blur(6px)',
};

export default async function Home() {
  let health: Health | null = null;

  try {
    health = await api<Health>('/health');
  } catch {
    health = null;
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: `radial-gradient(1100px 500px at 80% -10%, rgba(46,139,255,0.18), transparent 60%), radial-gradient(800px 450px at 0% 0%, rgba(34,211,238,0.12), transparent 55%), ${colors.void}`,
        color: colors.chrome,
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
        {/* Hero art */}
        <div
          style={{
            position: 'relative',
            borderRadius: 18,
            overflow: 'hidden',
            border: `1px solid ${colors.edge}`,
            boxShadow: '0 0 60px rgba(46,139,255,0.25)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/master-welcome.png"
            alt="A new kingdom rises — welcome to Master"
            style={{ display: 'block', width: '100%', height: 'auto' }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(5,6,10,0.9), transparent 55%)',
            }}
          />
          <div style={{ position: 'absolute', left: '2rem', bottom: '1.6rem', right: '2rem' }}>
            <div
              style={{
                fontSize: '0.75rem',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: colors.cyan,
                fontWeight: 700,
              }}
            >
              By the power of Master
            </div>
            <h1 style={{ margin: '0.35rem 0 0', fontSize: 'clamp(1.8rem, 4.5vw, 3rem)', lineHeight: 1.1 }}>
              Your kingdom awaits.
            </h1>
            <p style={{ margin: '0.5rem 0 0', color: colors.steel, maxWidth: 560 }}>
              You just created a full-stack Master app — a Next.js frontend, a MasterController API, and a
              MasterRecord database, wired together and running.
            </p>
          </div>
        </div>

        {/* Status row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginTop: 20 }}>
          <div style={card}>
            <div style={{ fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: colors.dim }}>
              Frontend
            </div>
            <div style={{ marginTop: 6, fontWeight: 600 }}>
              <span style={{ color: colors.energy }}>●</span> Next.js — running
            </div>
            <div style={{ marginTop: 4, fontSize: '0.85rem', color: colors.steel }}>
              This page is <code style={{ color: colors.cyan }}>frontend/app/page.tsx</code>
            </div>
          </div>
          <div style={card}>
            <div style={{ fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: colors.dim }}>
              Backend API
            </div>
            <div style={{ marginTop: 6, fontWeight: 600 }}>
              {health?.ok ? (
                <>
                  <span style={{ color: colors.energy }}>●</span> MasterController — connected
                </>
              ) : (
                <>
                  <span style={{ color: '#ff5f57' }}>●</span> Not reachable — run{' '}
                  <code style={{ color: colors.cyan }}>master dev</code>
                </>
              )}
            </div>
            <div style={{ marginTop: 4, fontSize: '0.85rem', color: colors.steel }}>
              {health?.ok
                ? `Answered /health at ${new Date(health.time).toLocaleTimeString()}`
                : 'The welcome page checks GET /health on the API'}
            </div>
          </div>
        </div>

        {/* Next steps */}
        <h2 style={{ marginTop: '2.6rem', fontSize: '1.25rem' }}>Claim the power</h2>
        <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
          {[
            {
              n: '01',
              title: 'Scaffold your first resource',
              cmd: 'master generate scaffold post title:string body:text',
              desc: 'Creates a model, a REST API, routes, and a page — wired together.',
            },
            {
              n: '02',
              title: 'Create the database schema',
              cmd: 'master db new PostInit && master db migrate',
              desc: 'Code-first migrations via MasterRecord.',
            },
            {
              n: '03',
              title: 'Build your UI',
              cmd: 'frontend/app/posts/page.tsx',
              desc: 'Server Components fetch from the API through app/lib/api.ts.',
            },
          ].map((s) => (
            <div key={s.n} style={{ ...card, display: 'flex', gap: 16, alignItems: 'baseline' }}>
              <span style={{ color: colors.blue, fontWeight: 800, fontSize: '0.9rem' }}>{s.n}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600 }}>{s.title}</div>
                <code
                  style={{
                    display: 'inline-block',
                    margin: '6px 0',
                    padding: '4px 10px',
                    borderRadius: 8,
                    background: 'rgba(46,139,255,0.12)',
                    border: '1px solid rgba(46,139,255,0.25)',
                    color: colors.cyan,
                    fontSize: '0.85rem',
                    overflowWrap: 'anywhere',
                  }}
                >
                  {s.cmd}
                </code>
                <div style={{ fontSize: '0.85rem', color: colors.steel }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Links */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: '2.2rem' }}>
          {[
            { label: 'Documentation', href: 'https://masterjs.org/docs' },
            { label: 'MasterController', href: 'https://masterjs.org/mastercontroller' },
            { label: 'MasterRecord', href: 'https://masterjs.org/masterrecord' },
            { label: 'GitHub', href: 'https://github.com/Tailor/Master' },
          ].map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              style={{
                padding: '0.6rem 1.1rem',
                borderRadius: 10,
                border: `1px solid ${colors.edge}`,
                color: colors.chrome,
                textDecoration: 'none',
                fontSize: '0.9rem',
                background: 'rgba(46,139,255,0.08)',
              }}
            >
              {l.label} ↗
            </a>
          ))}
        </div>

        <p style={{ marginTop: '3rem', color: colors.dim, fontSize: '0.85rem' }}>
          Master · masterjs.org — you have the power. ⚡
        </p>
      </div>
    </main>
  );
}
