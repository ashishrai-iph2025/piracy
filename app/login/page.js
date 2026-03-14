import dynamic from 'next/dynamic'

// Disable SSR for the login page entirely — browser extensions (e.g. password managers)
// inject elements like <shark-icon-container> into the DOM, causing hydration mismatches
// when React tries to reconcile server-rendered HTML with client HTML.
// With ssr:false, no server HTML is produced, so there is nothing to mismatch.
const LoginClient = dynamic(() => import('./LoginClient'), {
  ssr: false,
  loading: () => <div style={{ minHeight: '100vh', background: 'var(--bg, #f8fafc)' }} />,
})

export default function LoginPage() {
  return <LoginClient />
}
