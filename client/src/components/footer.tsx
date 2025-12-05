import { ExternalLink } from "lucide-react";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full py-6 px-4 bg-background border-t mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <img
                        src="/sfeir-logo.svg"
                        alt="SFEIR Logo"
                        className="w-8 h-8 rounded-md"
                    />
                    <span className="font-semibold">SFEIR</span>
                </div>

                <div className="flex items-center gap-4">
                    <span>&copy; {currentYear} SFEIR. Tous droits réservés.</span>
                    <a
                        href="https://www.sfeir.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                    >
                        sfeir.com
                        <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
            </div>
        </footer>
    );
}
