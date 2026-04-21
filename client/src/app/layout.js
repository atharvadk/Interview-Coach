import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { InterviewProvider } from '@/context/InterviewContext';

export const metadata = {
  title: 'AI Interview Coach',
  description: 'Practice smarter, get hired.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <InterviewProvider>
            <div className="noise-overlay" />
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#111118',
                  color: '#F0F0F5',
                  border: '1px solid rgba(255,255,255,0.07)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                },
                success: {
                  iconTheme: { primary: '#00FFB3', secondary: '#0A0A0F' },
                },
                error: {
                  iconTheme: { primary: '#FF4757', secondary: '#0A0A0F' },
                },
              }}
            />
          </InterviewProvider>
        </AuthProvider>
      </body>
    </html>
  );
}