'use client'

import { useState } from 'react'
import { Github, Loader2, X, CheckCircle2, ExternalLink, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface GitHubExportButtonProps {
  language: 'tr' | 'en'
}

export function GitHubExportButton({ language }: GitHubExportButtonProps): React.JSX.Element {
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
      console.log('🚀 GITHUB EXPORT BAŞLADI');
      console.log('═══════════════════════════════════════');
      
      // Yeni endpoint'i kullan - TÜM dosyaları export eder
      const response = await fetch('/api/github/export-full-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          repoName,
          repoDescription: repoDescription || 'VOLT - Turkish Crypto News Aggregator',
        }),
      })

      const data = await response.json() as { 
        success?: boolean
        repoUrl?: string
        error?: string
        message?: string
        stats?: {
          total: number
          uploaded: number
          failed: number
          failedFiles: string[]
        }
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Export işlemi başarısız oldu')
      }

      setSuccess(data.repoUrl || '')
      
      // İstatistikleri göster
      if (data.stats) {
        console.log(`✅ ${data.stats.uploaded}/${data.stats.total} dosya yüklendi`)
        if (data.stats.failed > 0) {
          console.warn('⚠️ Yüklenemeyen dosyalar:', data.stats.failedFiles)
        }
      }
      
      // Clear form after 5 seconds
      setTimeout(() => {
        setShowDialog(false)
        setToken('')
        setSuccess('')
      }, 5000)
    } catch (err) {
      console.error('❌ Export error:', err);
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
                          ? 'Tüm kodlar GitHub\'a aktarıldı!' 
                          : 'All code exported to GitHub!'}
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
