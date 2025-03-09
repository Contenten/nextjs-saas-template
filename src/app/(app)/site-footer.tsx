import pkg from "@/../package.json";
import { siteConfig } from "@/config/site";
import { ModeToggle } from "@/components/mode-toggle";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-grid border-t py-8 md:px-8">
      <div className="container-wrapper">
        <div className="container">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {/* Column 1: Company */}
            <div className="flex flex-col space-y-4">
              <h3 className="text-lg font-medium">Company</h3>
              <div className="flex flex-col space-y-2 text-sm text-muted-foreground">
                <Link
                  href="/about"
                  className="hover:text-foreground hover:underline"
                >
                  About
                </Link>
                <Link
                  href="/blog"
                  className="hover:text-foreground hover:underline"
                >
                  Blog
                </Link>
                <Link
                  href="/careers"
                  className="hover:text-foreground hover:underline"
                >
                  Careers
                </Link>
                <Link
                  href="/contact"
                  className="hover:text-foreground hover:underline"
                >
                  Contact
                </Link>
              </div>
            </div>

            {/* Column 2: Product */}
            <div className="flex flex-col space-y-4">
              <h3 className="text-lg font-medium">Product</h3>
              <div className="flex flex-col space-y-2 text-sm text-muted-foreground">
                <Link
                  href="/pricing"
                  className="hover:text-foreground hover:underline"
                >
                  Pricing
                </Link>
                <Link
                  href="/features"
                  className="hover:text-foreground hover:underline"
                >
                  Features
                </Link>
                <Link
                  href="/docs"
                  className="hover:text-foreground hover:underline"
                >
                  Documentation
                </Link>
                <Link
                  href="/changelog"
                  className="hover:text-foreground hover:underline"
                >
                  Changelog
                </Link>
              </div>
            </div>

            {/* Column 3: Resources */}
            <div className="flex flex-col space-y-4">
              <h3 className="text-lg font-medium">Resources</h3>
              <div className="flex flex-col space-y-2 text-sm text-muted-foreground">
                <Link
                  href="/faq"
                  className="hover:text-foreground hover:underline"
                >
                  FAQ
                </Link>
                <Link
                  href="/support"
                  className="hover:text-foreground hover:underline"
                >
                  Support
                </Link>
                <Link
                  href="/privacy"
                  className="hover:text-foreground hover:underline"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="hover:text-foreground hover:underline"
                >
                  Terms of Service
                </Link>
              </div>
            </div>

            {/* Column 4: Social & Theme Toggle */}
            <div className="flex flex-col space-y-4">
              <h3 className="text-lg font-medium">Connect</h3>
              <div className="flex flex-col space-y-2 text-sm text-muted-foreground">
                <a
                  href={siteConfig.links.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-foreground hover:underline"
                >
                  Twitter
                </a>
                <a
                  href={siteConfig.links.github}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-foreground hover:underline"
                >
                  GitHub
                </a>
              </div>
              <div className="mt-auto flex items-center pt-4">
                <span className="text-sm text-muted-foreground mr-2">
                  Theme
                </span>
                <ModeToggle />
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 border-t pt-6 flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-muted-foreground mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} {siteConfig.name}. All rights
              reserved.
            </div>
            <div className="text-sm text-muted-foreground">
              Built by{" "}
              <a
                href={siteConfig.links.twitter}
                target="_blank"
                rel="noreferrer"
                className="font-medium underline underline-offset-4"
              >
                wcw
              </a>
              .
              {!pkg.private && (
                <>
                  {" "}
                  Source code available on{" "}
                  <a
                    href={siteConfig.links.github}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium underline underline-offset-4"
                  >
                    GitHub
                  </a>
                  .
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
