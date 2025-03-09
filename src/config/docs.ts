import type { MainNavItem, SidebarNavItem } from "types/nav";

export interface DocsConfig {
  mainNav: MainNavItem[];
  sidebarNav: SidebarNavItem[];
}

export const docsConfig: DocsConfig = {
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "Documentation",
      href: "/docs",
    },
  ],
  sidebarNav: [
    {
      title: "Getting Started",
      items: [
        {
          title: "Introduction",
          href: "/docs",
          items: [],
        },
        {
          title: "Theming",
          href: "/docs/theming",
          items: [],
        },
        {
          title: "Dark mode",
          href: "/docs/dark-mode",
          items: [],
        },
        {
          title: "Deployment",
          href: "/docs/deploy",
          items: [],
        },
        {
          title: "Branch Management",
          href: "/docs/branch-management",
          items: [],
        },
        {
          title: "Saas Features",
          href: "/docs/saas",
          items: [],
        },
      ],
    },
  ],
};
