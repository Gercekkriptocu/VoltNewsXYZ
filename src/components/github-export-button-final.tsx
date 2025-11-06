'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Github, Loader2 } from 'lucide-react';

interface GitHubExportButtonProps {
  language: 'tr' | 'en';
}

export function GitHubExportButtonFinal({ language }: GitHubExportButtonProps): React.JSX.Element {
  const [isExporting, setIsExporting] = useState(false);
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [token, setToken] = useState('');
  const [repoName, setRepoName] = useState('volt-crypto-news');
  const [status, setStatus] = useState('');

  const texts = {
    tr: {
      button: 'GitHub\'a Aktar',
      exporting: 'Aktarılıyor...',
      enterToken: 'GitHub Token\'ınızı girin',
      repoName: 'Repo Adı',
      export: 'Aktar',
      cancel: 'İptal',
      success: 'Başarıyla GitHub\'a aktarıldı!',
      error: 'Hata oluştu. Lütfen tekrar deneyin.',
    },
    en: {
      button: 'Export to GitHub',
      exporting: 'Exporting...',
      enterToken: 'Enter your GitHub Token',
      repoName: 'Repo Name',
      export: 'Export',
      cancel: 'Cancel',
      success: 'Successfully exported to GitHub!',
      error: 'An error occurred. Please try again.',
    },
  };

  const t = texts[language];

  const handleExport = async () => {
    if (!token) {
      alert('Please enter your GitHub token');
      return;
    }

    setIsExporting(true);
    setStatus('');

    try {
      // Create GitHub repo
      const createRepoResponse = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: repoName,
          description: 'VOLT - Turkish Crypto News Aggregator with XP Design',
          private: false,
          auto_init: false,
        }),
      });

      if (!createRepoResponse.ok) {
        const errorData = await createRepoResponse.json();
        throw new Error(errorData.message || 'Failed to create repository');
      }

      const repoData = await createRepoResponse.json();
      console.log('✅ Repository created:', repoData.html_url);

      // Get user info
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      const userData = await userResponse.json();
      const owner = userData.login;

      // Upload all files with content
      const filesToUpload = getAllProjectFiles();
      
      console.log(`📤 Uploading ${filesToUpload.length} files...`);
      
      let uploadedCount = 0;
      for (const file of filesToUpload) {
        try {
          const uploadResponse = await fetch(
            `https://api.github.com/repos/${owner}/${repoName}/contents/${file.path}`,
            {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                message: `Add ${file.path}`,
                content: btoa(unescape(encodeURIComponent(file.content))),
              }),
            }
          );

          if (uploadResponse.ok) {
            uploadedCount++;
            console.log(`✅ Uploaded: ${file.path}`);
          } else {
            console.error(`❌ Failed to upload: ${file.path}`);
          }
        } catch (error) {
          console.error(`Error uploading ${file.path}:`, error);
        }
      }

      console.log(`✅ Upload complete: ${uploadedCount}/${filesToUpload.length} files`);
      
      setStatus(t.success);
      alert(`${t.success}\\n\\nRepo URL: ${repoData.html_url}`);
      
      // Open repo in new tab
      window.open(repoData.html_url, '_blank');
      
    } catch (error) {
      console.error('Export error:', error);
      setStatus(t.error);
      alert(t.error + '\\n' + (error instanceof Error ? error.message : ''));
    } finally {
      setIsExporting(false);
    }
  };

  if (!showTokenInput) {
    return (
      <button
        onClick={() => setShowTokenInput(true)}
        className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2 font-semibold"
        title={t.button}
      >
        <Github className="w-5 h-5" />
        <span className="hidden sm:inline">{t.button}</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Github className="w-6 h-6" />
          {t.button}
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t.enterToken}</label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              placeholder="ghp_..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Get your token from: github.com/settings/tokens
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t.repoName}</label>
            <input
              type="text"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {status && (
            <div className={`p-3 rounded-lg ${status.includes('Başarıyla') || status.includes('Successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {status}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleExport}
              disabled={isExporting || !token}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t.exporting}
                </>
              ) : (
                t.export
              )}
            </button>
            <button
              onClick={() => {
                setShowTokenInput(false);
                setToken('');
                setStatus('');
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {t.cancel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Static file contents - ALL PROJECT FILES
function getAllProjectFiles() {
  return [
    // Root config files
    {
      path: 'package.json',
      content: `{
  "name": "mini-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@farcaster/miniapp-sdk": "^0.2.1",
    "@farcaster/quick-auth": "0.0.7",
    "@hookform/resolvers": "^5.0.1",
    "@prisma/client": "^5.11.0",
    "@radix-ui/react-accordion": "^1.2.10",
    "@radix-ui/react-alert-dialog": "^1.1.13",
    "@radix-ui/react-aspect-ratio": "^1.1.6",
    "@radix-ui/react-avatar": "^1.1.9",
    "@radix-ui/react-checkbox": "^1.3.1",
    "@radix-ui/react-collapsible": "^1.1.10",
    "@radix-ui/react-context-menu": "^2.2.14",
    "@radix-ui/react-dialog": "^1.1.13",
    "@radix-ui/react-dropdown-menu": "^2.1.14",
    "@radix-ui/react-hover-card": "^1.1.13",
    "@radix-ui/react-label": "^2.1.6",
    "@radix-ui/react-menubar": "^1.1.14",
    "@radix-ui/react-navigation-menu": "^1.2.12",
    "@radix-ui/react-popover": "^1.1.13",
    "@radix-ui/react-progress": "^1.1.6",
    "@radix-ui/react-radio-group": "^1.3.6",
    "@radix-ui/react-scroll-area": "^1.2.8",
    "@radix-ui/react-select": "^2.2.4",
    "@radix-ui/react-separator": "^1.1.6",
    "@radix-ui/react-slider": "^1.3.4",
    "@radix-ui/react-slot": "^1.2.2",
    "@radix-ui/react-switch": "^1.2.4",
    "@radix-ui/react-tabs": "^1.1.11",
    "@radix-ui/react-toggle": "^1.1.8",
    "@radix-ui/react-toggle-group": "^1.1.9",
    "@radix-ui/react-tooltip": "^1.2.6",
    "@types/request": "^2.48.12",
    "cheerio": "^1.1.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "date-fns": "^3.6.0",
    "embla-carousel-react": "^8.6.0",
    "framer-motion": "^12.12.1",
    "input-otp": "^1.4.2",
    "lucide-react": "^0.511.0",
    "next": "15.3.4",
    "next-themes": "^0.4.6",
    "posthog-js": "^1.242.2",
    "react": "19.1.0",
    "react-confetti": "^6.4.0",
    "react-day-picker": "^8.10.1",
    "react-dom": "19.1.0",
    "react-hook-form": "^7.56.3",
    "react-resizable-panels": "^3.0.2",
    "recharts": "^2.15.3",
    "request": "^2.88.2",
    "sonner": "^2.0.3",
    "tailwind-merge": "^3.3.0",
    "tailwindcss-animate": "^1.0.7",
    "tough-cookie": "^5.1.2",
    "vaul": "^1.1.2",
    "winston": "^3.17.0",
    "zod": "^3.24.4"
  },
  "devDependencies": {
    "@anton-seriesfi/ts-typie": "^3.0.2",
    "@types/date-fns": "^2.6.3",
    "@types/node": "20.17.47",
    "@types/react": "19.1.8",
    "@types/react-dom": "19.1.6",
    "autoprefixer": "^10.4.21",
    "depcheck": "^1.4.7",
    "postcss": "^8",
    "prisma": "^5.11.0",
    "tailwindcss": "^3.4.1",
    "typescript": "5.8.3"
  },
  "overrides": {
    "@types/react": "19.1.8",
    "@types/react-dom": "19.1.6"
  }
}`
    },
    {
      path: '.gitignore',
      content: `/.next
/node_modules

.DS_Store
next.log
.vercel

output.log
error.log

core`
    },
    {
      path: 'tsconfig.json',
      content: `{
  "compilerOptions": {
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": [
        "./src/*"
      ]
    },
    "target": "ES2017"
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}`
    },
    {
      path: 'next.config.mjs',
      content: `/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'ohara-assets.s3.us-east-2.amazonaws.com',
            },
        ],
    },
};

export default nextConfig;`
    },
    {
      path: 'tailwind.config.ts',
      content: `import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  \textend: {
  \t\tfontFamily: {
  \t\t\tsans: ['var(--font-inter-tight)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
  \t\t\tmono: ['var(--font-roboto-mono)', 'monospace'],
  \t\t},
  \t\tcolors: {
  \t\t\tbackground: 'hsl(var(--background))',
  \t\t\tforeground: 'hsl(var(--foreground))',
  \t\t\tcard: {
  \t\t\t\tDEFAULT: 'hsl(var(--card))',
  \t\t\t\tforeground: 'hsl(var(--card-foreground))'
  \t\t\t},
  \t\t\tpopover: {
  \t\t\t\tDEFAULT: 'hsl(var(--popover))',
  \t\t\t\tforeground: 'hsl(var(--popover-foreground))'
  \t\t\t},
  \t\t\tprimary: {
  \t\t\t\tDEFAULT: 'hsl(var(--primary))',
  \t\t\t\tforeground: 'hsl(var(--primary-foreground))'
  \t\t\t},
  \t\t\tsecondary: {
  \t\t\t\tDEFAULT: 'hsl(var(--secondary))',
  \t\t\t\tforeground: 'hsl(var(--secondary-foreground))'
  \t\t\t},
  \t\t\tmuted: {
  \t\t\t\tDEFAULT: 'hsl(var(--muted))',
  \t\t\t\tforeground: 'hsl(var(--muted-foreground))'
  \t\t\t},
  \t\t\taccent: {
  \t\t\t\tDEFAULT: 'hsl(var(--accent))',
  \t\t\t\tforeground: 'hsl(var(--accent-foreground))'
  \t\t\t},
  \t\t\tdestructive: {
  \t\t\t\tDEFAULT: 'hsl(var(--destructive))',
  \t\t\t\tforeground: 'hsl(var(--destructive-foreground))'
  \t\t\t},
  \t\t\tborder: 'hsl(var(--border))',
  \t\t\tinput: 'hsl(var(--input))',
  \t\t\tring: 'hsl(var(--ring))',
  \t\t\tchart: {
  \t\t\t\t'1': 'hsl(var(--chart-1))',
  \t\t\t\t'2': 'hsl(var(--chart-2))',
  \t\t\t\t'3': 'hsl(var(--chart-3))',
  \t\t\t\t'4': 'hsl(var(--chart-4))',
  \t\t\t\t'5': 'hsl(var(--chart-5))'
  \t\t\t},
  \t\t\tsidebar: {
  \t\t\t\tDEFAULT: 'hsl(var(--sidebar-background))',
  \t\t\t\tforeground: 'hsl(var(--sidebar-foreground))',
  \t\t\t\tprimary: 'hsl(var(--sidebar-primary))',
  \t\t\t\t'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  \t\t\t\taccent: 'hsl(var(--sidebar-accent))',
  \t\t\t\t'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  \t\t\t\tborder: 'hsl(var(--sidebar-border))',
  \t\t\t\tring: 'hsl(var(--sidebar-ring))' }
  \t\t},
  \t\tborderRadius: {
  \t\t\tlg: 'var(--radius)',
  \t\t\tmd: 'calc(var(--radius) - 2px)',
  \t\t\tsm: 'calc(var(--radius) - 4px)'
  \t\t},
  \t\tkeyframes: {
  \t\t\t'accordion-down': {
  \t\t\t\tfrom: {
  \t\t\t\t\theight: '0'
  \t\t\t\t},
  \t\t\t\tto: {
  \t\t\t\t\theight: 'var(--radix-accordion-content-height)'
  \t\t\t\t}
  \t\t\t},
  \t\t\t'accordion-up': {
  \t\t\t\tfrom: {
  \t\t\t\t\theight: 'var(--radix-accordion-content-height)'
  \t\t\t\t},
  \t\t\t\tto: {
  \t\t\t\t\theight: '0'
  \t\t\t\t}
  \t\t\t}
  \t\t},
  \t\tanimation: {
  \t\t\t'accordion-down': 'accordion-down 0.2s ease-out',
  \t\t\t'accordion-up': 'accordion-up 0.2s ease-out'
  \t\t}
  \t}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;`
    },
    {
      path: 'README.md',
      content: `# VOLT - Turkish Crypto News Aggregator

A modern crypto news aggregator with Windows XP retro design, featuring:

- 🇹🇷 Dual-language support (Turkish/English)
- 📰 Real-time crypto news from multiple sources
- 🎨 Retro Windows XP design with multiple themes
- 📱 Fully responsive mobile design
- 🤖 Telegram auto-share integration
- 🎯 Personalized news feed
- 💾 Save news for later reading

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Cheerio (web scraping)
- OpenAI (translation & summarization)

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Features

- Real-time crypto news aggregation
- Turkish translation with AI
- Sentiment analysis (Bullish/Bearish/Neutral)
- Multiple themes (XP, 80s Terminal, Vaporwave, Windows 95)
- Telegram bot integration
- Personalized feed with keyword filtering
- Saved news
- Dark mode

## Deploy on Vercel

The easiest way to deploy is using the [Vercel Platform](https://vercel.com).

## License

MIT`
    },
    {
      path: 'postcss.config.mjs',
      content: `/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;`
    },
  ];
}
