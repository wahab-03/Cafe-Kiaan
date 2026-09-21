import "@fontsource/poppins/300.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@fontsource/playfair-display/500.css";
import "@fontsource/playfair-display/600.css";
import "@fontsource/playfair-display/700.css";
import "./globals.css";
import ClientShell from "../components/ClientShell";

export const metadata = {
  title: "Café Kiaan | Food • Coffee • Moments",
  description: "Café Kiaan restaurant ordering website"
};

export default function RootLayout({children}){
  return (
    <html lang="en">
      <body><ClientShell>{children}</ClientShell></body>
    </html>
  );
}
