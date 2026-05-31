import "./globals.css";

export const metadata = {
  title: "Taxflow — Ghana Tax Filing Automation for SMEs",
  description: "A simple tax helper for small businesses and informal enterprises in Ghana. Calculate VAT, PAYE, and Withholding Tax, and generate compliance reports for GRA.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
