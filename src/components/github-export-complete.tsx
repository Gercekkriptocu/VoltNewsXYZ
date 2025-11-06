'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Github, Loader2 } from 'lucide-react';

/**
 * GitHub Export Button - COMPLETE VERSION
 * Statik dosya koleksiyonunu GitHub'a yükler
 */

export function GitHubExportComplete(): React.JSX.Element {
  const [token, setToken] = useState<string>('');
  const [repoName, setRepoName] = useState<string>('volt-news-app');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  const handleExport = async (): Promise<void> => {
    if (!token.trim()) {
      setMessage('❌ GitHub token gerekli!');
      return;
    }

    if (!repoName.trim()) {
      setMessage('❌ Repo adı gerekli!');
      return;
    }

    setIsExporting(true);
    setMessage('⏳ GitHub repo oluşturuluyor...');

    try {
      console.log('🚀 GitHub Export Başladı');
      
      // Dosya koleksiyonu
      const files = getStaticFileCollection();
      
      console.log(`📦 Toplam ${files.length} dosya hazır`);

      // GitHub'da yeni repo oluştur
      const createRepoResponse = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github+json'
        },
        body: JSON.stringify({
          name: repoName,
          description: 'VOLT - Turkish Crypto News Aggregator (Exported from Ohara)',
          private: false,
          auto_init: false
        })
      });

      if (!createRepoResponse.ok) {
        const errorData = await createRepoResponse.json().catch(() => ({}));
        throw new Error(`Repo oluşturulamadı: ${errorData.message || createRepoResponse.statusText}`);
      }

      const repoData = await createRepoResponse.json();
      const repoFullName = repoData.full_name;
      
      setMessage(`✅ Repo oluşturuldu: ${repoFullName}`);
      console.log(`✅ Repo created: ${repoFullName}`);

      // Dosyaları yükle
      setMessage(`⏳ ${files.length} dosya yükleniyor...`);
      
      let uploadedCount = 0;
      let failedCount = 0;

      for (const file of files) {
        try {
          console.log(`📤 Uploading: ${file.path}`);
          
          const uploadResponse = await fetch(
            `https://api.github.com/repos/${repoFullName}/contents/${file.path}`,
            {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github+json'
              },
              body: JSON.stringify({
                message: `Add ${file.path}`,
                content: btoa(unescape(encodeURIComponent(file.content)))
              })
            }
          );

          if (uploadResponse.ok) {
            uploadedCount++;
            console.log(`✅ Uploaded: ${file.path}`);
          } else {
            failedCount++;
            console.error(`❌ Failed to upload: ${file.path}`);
          }
          
          // Progress mesajı
          if (uploadedCount % 5 === 0) {
            setMessage(`⏳ ${uploadedCount}/${files.length} dosya yüklendi...`);
          }
        } catch (error) {
          failedCount++;
          console.error(`❌ Error uploading ${file.path}:`, error);
        }
      }

      setMessage(`✅ Tamamlandı! ${uploadedCount} dosya yüklendi, ${failedCount} hata.`);
      console.log(`✅ Export complete: ${uploadedCount} uploaded, ${failedCount} failed`);

    } catch (error) {
      console.error('❌ Export error:', error);
      setMessage(`❌ Hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border-2 border-blue-500 rounded-lg p-4 shadow-xl z-50 min-w-[320px]">
      <div className="flex items-center gap-2 mb-3">
        <Github className="w-5 h-5 text-blue-600" />
        <h3 className="font-bold text-gray-900 dark:text-white">GitHub'a Aktar</h3>
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor="token" className="text-xs">GitHub Token</Label>
          <Input
            id="token"
            type="password"
            placeholder="ghp_xxxxxxxxxxxx"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            disabled={isExporting}
            className="text-sm"
          />
        </div>

        <div>
          <Label htmlFor="repoName" className="text-xs">Repo Adı</Label>
          <Input
            id="repoName"
            type="text"
            placeholder="volt-news-app"
            value={repoName}
            onChange={(e) => setRepoName(e.target.value)}
            disabled={isExporting}
            className="text-sm"
          />
        </div>

        <Button 
          onClick={handleExport}
          disabled={isExporting || !token.trim()}
          className="w-full"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Yükleniyor...
            </>
          ) : (
            <>
              <Github className="w-4 h-4 mr-2" />
              Aktar
            </>
          )}
        </Button>

        {message && (
          <div className="text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 p-2 rounded">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Statik dosya koleksiyonu - kritik dosyalar
 */
function getStaticFileCollection(): Array<{ path: string; content: string }> {
  return [
    {
      path: 'README.md',
      content: `# VOLT - Turkish Crypto News Aggregator

A Turkish-focused crypto news aggregator built with Next.js, featuring real-time updates, Telegram integration, and a retro Windows XP theme.

## Features

- 🌍 Dual-language support (Turkish & English)
- 📰 Real-time crypto news from multiple sources
- 💬 Telegram bot integration for automatic news sharing
- 🎨 Retro Windows XP design with draggable elements
- 📊 Live crypto price ticker
- 🔄 Infinite scroll and pull-to-refresh
- 📱 Fully responsive mobile design

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Scraping**: Cheerio
- **APIs**: Tree of Alpha, Bloomberg, Exa, OpenAI, Telegram
- **Deployment**: Vercel

## Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/volt-news-app.git

# Navigate to the project directory
cd volt-news-app

# Install dependencies
npm install

# Run the development server
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Configuration

### Telegram Bot

Update the Telegram bot token and channel ID in:
- \`src/app/api/telegram/auto-share/route.ts\`

### API Keys

API keys are already configured in the code:
- **Exa API**: \`src/exa-api.ts\`
- **OpenAI API**: \`src/openai-api.ts\`
- **0x API**: \`src/0x-api.ts\`

## Deployment

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/volt-news-app)

## License

MIT License - feel free to use this project for your own purposes.

## Credits

Built with ❤️ using Ohara AI Platform
`
    },
    {
      path: '.gitignore',
      content: `# dependencies
/node_modules
/.pnp
.pnp.js
.yarn/install-state.gz

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
`
    },
    {
      path: 'package.json',
      content: `{
  "name": "volt-news-app",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@farcaster/miniapp-sdk": "^0.1.41",
    "@farcaster/quick-auth": "^2.0.3",
    "@hookform/resolvers": "^3.9.0",
    "@prisma/client": "^6.1.0",
    "@radix-ui/react-accordion": "^1.2.2",
    "@radix-ui/react-alert-dialog": "^1.1.4",
    "@radix-ui/react-aspect-ratio": "^1.1.1",
    "@radix-ui/react-avatar": "^1.1.2",
    "@radix-ui/react-checkbox": "^1.1.3",
    "@radix-ui/react-collapsible": "^1.1.2",
    "@radix-ui/react-context-menu": "^2.2.4",
    "@radix-ui/react-dialog": "^1.1.4",
    "@radix-ui/react-dropdown-menu": "^2.1.4",
    "@radix-ui/react-hover-card": "^1.1.4",
    "@radix-ui/react-label": "^2.1.1",
    "@radix-ui/react-menubar": "^1.1.4",
    "@radix-ui/react-navigation-menu": "^1.2.3",
    "@radix-ui/react-popover": "^1.1.4",
    "@radix-ui/react-progress": "^1.1.1",
    "@radix-ui/react-radio-group": "^1.2.2",
    "@radix-ui/react-scroll-area": "^1.2.2",
    "@radix-ui/react-select": "^2.1.4",
    "@radix-ui/react-separator": "^1.1.1",
    "@radix-ui/react-slider": "^1.2.2",
    "@radix-ui/react-slot": "^1.1.1",
    "@radix-ui/react-switch": "^1.1.2",
    "@radix-ui/react-tabs": "^1.1.2",
    "@radix-ui/react-toast": "^1.2.4",
    "@radix-ui/react-toggle": "^1.1.1",
    "@radix-ui/react-toggle-group": "^1.1.1",
    "@radix-ui/react-tooltip": "^1.1.6",
    "@types/request": "^2.48.12",
    "cheerio": "^1.0.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.0.4",
    "date-fns": "^4.1.0",
    "embla-carousel-react": "^8.5.1",
    "framer-motion": "^11.18.1",
    "input-otp": "^1.4.1",
    "lucide-react": "^0.468.0",
    "next": "15.1.3",
    "next-themes": "^0.4.4",
    "posthog-js": "^1.206.1",
    "react": "^19.0.0",
    "react-day-picker": "^9.4.4",
    "react-dom": "^19.0.0",
    "react-hook-form": "^7.54.2",
    "react-resizable-panels": "^2.1.8",
    "recharts": "^2.15.0",
    "request": "^2.88.2",
    "sonner": "^1.7.3",
    "tailwind-merge": "^2.6.0",
    "tailwindcss-animate": "^1.0.7",
    "tough-cookie": "^5.0.0",
    "vaul": "^1.1.4",
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "@anton-seriesfi/ts-typie": "^3.0.2",
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "autoprefixer": "^10.4.20",
    "depcheck": "^1.4.7",
    "postcss": "^8",
    "prisma": "^6.1.0",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  }
}`
    },
    {
      path: 'tsconfig.json',
      content: `{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
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
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}`
    },
    {
      path: 'tailwind.config.ts',
      content: `import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0'
          },
          to: {
            height: 'var(--radix-accordion-content-height)'
          }
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)'
          },
          to: {
            height: '0'
          }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;`
    },
    {
      path: 'next.config.mjs',
      content: `/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;`
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
    }
  ];
}
