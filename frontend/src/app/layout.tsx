import type { Metadata } from "next";
import { CopilotKitProvider } from "./CopilotKitProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "ThresHOLD Chatbot",
  description: "AI chatbot for schema, datasource, and form management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <CopilotKitProvider>{children}</CopilotKitProvider>
      </body>
    </html>
  );
}
