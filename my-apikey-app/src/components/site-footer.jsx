"use client"

export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} GitVault Github Analyser. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
