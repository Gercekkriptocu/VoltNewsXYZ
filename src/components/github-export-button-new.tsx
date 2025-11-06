'use client'

import { useState } from 'react'
import { Github, Loader2, X, CheckCircle2, ExternalLink, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface GitHubExportButtonProps {
  language: 'tr' | 'en'
}

// Kritik dosyaların içeriğini statik olarak tanımla
const getProjectFiles = (): Array<{ path: string; content: string }> => {
  return [
    {
      path: 'package.json',
      content: JSON.stringify({
        "name": "volt-crypto-news",
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
      }, null, 2)
    },
    {
      path: '.gitignore',
      content: `# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js

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
next-env.d.ts`
    }
  ];
};

export function GitHubExportButtonNew({ language }: GitHubExportButtonProps): React.JSX.Element {
  const [showDialog, setShowDialog] = useState<boolean>(false)
  const [token, setToken] = useState<string>('')
  const [repoName, setRepoName] = useState<string>('volt-crypto-news')
  const [repoDescription, setRepoDescription] = useState<string>('VOLT - Turkish Crypto News Aggregator')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [showToken, setShowToken] = useState<boolean>(false)

  const texts = {
    tr: {
      buttonTitle: 'GitHub\'a Aktar',
      title: 'GitHub\'a Kod Aktar',
      description: 'Tüm kodları GitHub repository\'sine yükleyin',
      tokenLabel: 'GitHub Token',
      tokenPlaceholder: 'ghp_xxxxxxxxxxxx',
      repoNameLabel: 'Repository Adı',
      repoNamePlaceholder: 'volt-crypto-news',
      repoDescLabel: 'Repository Açıklaması',
      repoDescPlaceholder: 'VOLT - Turkish Crypto News Aggregator',
      exportButton: 'GitHub\'a Aktar',
      exporting: 'Aktarılıyor...',
      close: 'Kapat',
      createToken: 'GitHub Token Oluştur',
      viewRepo: 'Repository\'yi Görüntüle',
      howToGetToken: 'Token Nasıl Alınır?',
      tokenSteps: [
        'Aşağıdaki butona tıklayın',
        '"Generate token" butonuna basın',
        'Token\'ı kopyalayın ve buraya yapıştırın'
      ]
    },
    en: {
      buttonTitle: 'Export to GitHub',
      title: 'Export Code to GitHub',
      description: 'Upload all code to GitHub repository',
      tokenLabel: 'GitHub Token',
      tokenPlaceholder: 'ghp_xxxxxxxxxxxx',
      repoNameLabel: 'Repository Name',
      repoNamePlaceholder: 'volt-crypto-news',
      repoDescLabel: 'Repository Description',
      repoDescPlaceholder: 'VOLT - Turkish Crypto News Aggregator',
      exportButton: 'Export to GitHub',
      exporting: 'Exporting...',
      close: 'Close',
      createToken: 'Create GitHub Token',
      viewRepo: 'View Repository',
      howToGetToken: 'How to Get Token?',
      tokenSteps: [
        'Click the button below',
        'Click "Generate token"',
        'Copy the token and paste it here'
      ]
    }
  }

  const t = texts[language]

  const handleExport = async (): Promise<void> => {
    if (!token || !repoName) {
      setError(language === 'tr' ? 'Lütfen tüm alanları doldurun' : 'Please fill all fields')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      console.log('═══════════════════════════════════════');
      console.log('🚀 GITHUB EXPORT BAŞLADI - YENİ SİSTEM');
      console.log('═══════════════════════════════════════');
      
      // Dosyaları statik olarak al
      const projectFiles = getProjectFiles();
      
      console.log('✅ Statik', projectFiles.length, 'dosya toplandı');
      
      // README.md ekle
      const readmeContent = `# ${repoName}

${repoDescription}

## VOLT - Turkish Crypto News Aggregator

Real-time crypto news aggregator with Turkish language support, Windows XP retro theme, and Telegram integration.

### Features
- 🌍 Dual language support (Turkish/English)
- 🎨 Retro Windows XP themed interface
- 📱 Real-time news updates
- 💬 Telegram auto-share integration
- 🎵 Winamp music player
- 🔔 Live crypto ticker
- 📊 Sentiment analysis
- ⚡ Degen mode for power users

### Tech Stack
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Farcaster Mini App SDK
- Cheerio for web scraping

### Setup

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Run development server:
\`\`\`bash
npm run dev
\`\`\`

3. Build for production:
\`\`\`bash
npm run build
\`\`\`

### Environment Variables

Create a \`.env.local\` file with:
\`\`\`
NEXT_PUBLIC_API_KEY=your_api_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
\`\`\`

### Deploy

Easily deploy to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/${repoName})

## License

MIT`;

      const allFiles = [
        { path: 'README.md', content: readmeContent },
        ...projectFiles
      ];

      console.log('📦 GitHub\'a', allFiles.length, 'dosya yükleniyor...');

      const response = await fetch('/api/github/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          repoName,
          repoDescription,
          files: allFiles,
        }),
      })

      const data = await response.json() as { success?: boolean; repoUrl?: string; message?: string; error?: string; filesUploaded?: number }

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Export işlemi başarısız oldu')
      }

      console.log('✅ GitHub\'a', data.filesUploaded, 'dosya başarıyla yüklendi!');
      setSuccess(data.repoUrl || '')
      
      // Form'u 5 saniye sonra temizle
      setTimeout(() => {
        setShowDialog(false)
        setToken('')
        setSuccess('')
      }, 5000)
    } catch (err) {
      console.error('❌ Export hatası:', err);
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const openGitHubTokenPage = (): void => {
    window.open('https://github.com/settings/tokens/new?description=VOLT%20Export&scopes=repo', '_blank')
  }

  return (
    <>
      {/* Floating Button - Right Middle */}
      <button
        onClick={() => setShowDialog(true)}
        className="fixed right-4 top-1/2 -translate-y-1/2 z-40 bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group"
        title={t.buttonTitle}
        style={{
          boxShadow: '0 8px 32px rgba(124, 58, 237, 0.5)',
        }}
      >
        <Github className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
      </button>

      {/* Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div 
            className="xp-window max-w-md w-full overflow-hidden"
            style={{
              animation: 'scaleIn 0.3s ease-out'
            }}
          >
            {/* XP Title Bar */}
            <div className="xp-title-bar">
              <div className="flex items-center gap-2">
                <Github className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-bold">{t.title}</span>
              </div>
              <button 
                className="xp-control-btn xp-close-btn" 
                onClick={() => setShowDialog(false)}
                disabled={loading}
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="bg-white p-6 space-y-4">
              {!success ? (
                <>
                  <p className="text-sm text-gray-600">
                    {t.description}
                  </p>

                  {/* Token Instructions */}
                  <div className="bg-blue-50 rounded-lg p-3 space-y-2">
                    <h4 className="font-semibold text-sm text-gray-900">{t.howToGetToken}</h4>
                    <ol className="text-xs text-gray-700 space-y-1 list-decimal list-inside">
                      {t.tokenSteps.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                    <Button
                      onClick={openGitHubTokenPage}
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                    >
                      <ExternalLink className="w-3 h-3 mr-2" />
                      {t.createToken}
                    </Button>
                  </div>

                  {/* Token Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">
                      {t.tokenLabel}
                    </label>
                    <div className="relative">
                      <Input
                        type={showToken ? 'text' : 'password'}
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder={t.tokenPlaceholder}
                        className="pr-10"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowToken(!showToken)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        disabled={loading}
                      >
                        {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Repository Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">
                      {t.repoNameLabel}
                    </label>
                    <Input
                      type="text"
                      value={repoName}
                      onChange={(e) => setRepoName(e.target.value)}
                      placeholder={t.repoNamePlaceholder}
                      disabled={loading}
                    />
                  </div>

                  {/* Repository Description */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">
                      {t.repoDescLabel}
                    </label>
                    <Input
                      type="text"
                      value={repoDescription}
                      onChange={(e) => setRepoDescription(e.target.value)}
                      placeholder={t.repoDescPlaceholder}
                      disabled={loading}
                    />
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                      <X className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  {/* Export Button */}
                  <Button
                    onClick={handleExport}
                    disabled={loading || !token || !repoName}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t.exporting}
                      </>
                    ) : (
                      <>
                        <Github className="w-4 h-4 mr-2" />
                        {t.exportButton}
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex flex-col items-center gap-3">
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                    <div className="text-center">
                      <h4 className="font-semibold text-green-900 mb-1">
                        {language === 'tr' ? 'Başarılı!' : 'Success!'}
                      </h4>
                      <p className="text-sm text-green-700">
                        {language === 'tr' 
                          ? 'Kodlar GitHub\'a aktarıldı!' 
                          : 'Code exported to GitHub!'}
                      </p>
                    </div>
                    <a
                      href={success}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 underline flex items-center gap-1"
                    >
                      {t.viewRepo}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
