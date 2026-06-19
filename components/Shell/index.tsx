import { Header } from "./Header";
import { Footer } from "./Footer";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
    </>
  );
}
