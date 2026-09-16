import type { Metadata } from 'next';
import './globals.css';
import './admin.css';

export const metadata: Metadata = {
  title: 'India Driving Licence Portal & Generator',
  description: 'Indian Union Driving Licence Admin Generator for Template 1, 2, and 3',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Roboto+Condensed:wght@400;700&display=swap"
          rel="stylesheet"
        />
        {/* Bootstrap 5.3.3 */}
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.3/css/bootstrap.min.css"
          rel="stylesheet"
        />
        {/* Font Awesome 6.5.1 */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </head>
      <body className="admin-body">
        {children}
      </body>
    </html>
  );
}
