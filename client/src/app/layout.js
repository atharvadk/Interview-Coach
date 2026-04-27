import "./globals.css";
import Providers from "@/components/Providers";

export const metadata = {
  title: "AI Interview Coach",
  description: "Practice smarter, get hired.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}