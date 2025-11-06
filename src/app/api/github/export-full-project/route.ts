import { NextRequest, NextResponse } from 'next/server'
import { readdir, readFile } from 'fs/promises'
import { join } from 'path'

interface FileItem {
  path: string
  content: string
  mode: string
  type: string
}

async function getAllFiles(dirPath: string, baseDir: string = dirPath): Promise<FileItem[]> {
  const files: FileItem[] = []
  
  try {
    const entries = await readdir(dirPath, { withFileTypes: true })
    console.log(`📂 Taranıyor: ${dirPath.replace(baseDir, '.')} (${entries.length} öğe)`)

    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name)
      
      // Skip node_modules, .next, .git etc.
      if (
        entry.name === 'node_modules' ||
        entry.name === '.next' ||
        entry.name === '.git' ||
        entry.name === 'dist' ||
        entry.name === 'build' ||
        entry.name === '.env' ||
        entry.name === '.env.local' ||
        (entry.name.startsWith('.') && entry.name !== '.well-known')
      ) {
        console.log(`⏭️  Atlandı: ${entry.name}`)
        continue
      }

      if (entry.isDirectory()) {
        console.log(`📁 Klasöre giriliyor: ${entry.name}`)
        // Recursively get files from subdirectories
        const subFiles = await getAllFiles(fullPath, baseDir)
        files.push(...subFiles)
        console.log(`✅ ${entry.name} klasöründen ${subFiles.length} dosya eklendi`)
      } else {
        // Read file content
        try {
          const content = await readFile(fullPath, 'utf-8')
          const relativePath = fullPath.replace(baseDir, '').replace(/^[\/\\]/, '')
          
          console.log(`📄 Dosya eklendi: ${relativePath}`)
          files.push({
            path: relativePath,
            content,
            mode: '100644',
            type: 'blob',
          })
        } catch (error) {
          console.error(`❌ Dosya okunamadı ${entry.name}:`, error)
        }
      }
    }
  } catch (error) {
    console.error(`❌ Klasör okunamadı ${dirPath}:`, error)
  }

  return files
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { token, repoName, repoDescription } = await request.json() as {
      token: string
      repoName: string
      repoDescription: string
    }

    if (!token || !repoName) {
      return NextResponse.json(
        { error: 'Token ve repo adı gereklidir' },
        { status: 400 }
      )
    }

    console.log('🚀 GitHub export başlatılıyor...')

    // 1. Get GitHub user info
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!userRes.ok) {
      return NextResponse.json(
        { error: 'GitHub kullanıcı bilgileri alınamadı' },
        { status: 401 }
      )
    }

    const userData = await userRes.json() as { login: string }
    console.log(`✅ Kullanıcı: ${userData.login}`)

    // 2. Create new repository
    const createRepoRes = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: repoName,
        description: repoDescription || 'VOLT - Turkish Crypto News Aggregator',
        private: false,
        auto_init: true,
      }),
    })

    if (!createRepoRes.ok) {
      const errorData = await createRepoRes.json() as { message: string }
      return NextResponse.json(
        { error: `Repository oluşturulamadı: ${errorData.message}` },
        { status: 400 }
      )
    }

    const repoData = await createRepoRes.json() as { 
      html_url: string
      default_branch: string 
    }
    
    console.log(`✅ Repo oluşturuldu: ${repoData.html_url}`)
    
    // Wait for repo initialization
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 3. Get all project files dynamically
    const projectRoot = process.cwd()
    console.log(`📂 Dosyalar toplanıyor: ${projectRoot}`)
    
    const allFiles = await getAllFiles(projectRoot)
    console.log(`✅ ${allFiles.length} dosya bulundu`)

    // 4. Upload files in batches
    const defaultBranch = repoData.default_branch || 'main'
    let uploadedCount = 0
    let failedFiles: string[] = []

    for (const file of allFiles) {
      try {
        const content = Buffer.from(file.content).toString('base64')
        
        // Check if file already exists
        const checkRes = await fetch(
          `https://api.github.com/repos/${userData.login}/${repoName}/contents/${file.path}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        
        let sha: string | undefined
        if (checkRes.ok) {
          const existingFile = await checkRes.json() as { sha: string }
          sha = existingFile.sha
        }
        
        const uploadRes = await fetch(
          `https://api.github.com/repos/${userData.login}/${repoName}/contents/${file.path}`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: `Add ${file.path}`,
              content: content,
              branch: defaultBranch,
              ...(sha && { sha }),
            }),
          }
        )

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json() as { message: string }
          console.error(`❌ Yüklenemedi ${file.path}: ${errorData.message}`)
          failedFiles.push(file.path)
        } else {
          uploadedCount++
          if (uploadedCount % 10 === 0 || uploadedCount === allFiles.length) {
            console.log(`📤 Yüklendi: ${uploadedCount}/${allFiles.length}`)
          }
        }

        // Rate limiting delay
        await new Promise(resolve => setTimeout(resolve, 300))
      } catch (error) {
        console.error(`❌ Hata ${file.path}:`, error)
        failedFiles.push(file.path)
      }
    }

    console.log(`✅ Tamamlandı! ${uploadedCount}/${allFiles.length} dosya yüklendi`)
    if (failedFiles.length > 0) {
      console.warn(`⚠️ ${failedFiles.length} dosya yüklenemedi:`, failedFiles)
    }

    return NextResponse.json({
      success: true,
      repoUrl: repoData.html_url,
      message: `Proje başarıyla GitHub'a yüklendi!`,
      stats: {
        total: allFiles.length,
        uploaded: uploadedCount,
        failed: failedFiles.length,
        failedFiles,
      },
    })
  } catch (error) {
    console.error('❌ Export hatası:', error)
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu'
    return NextResponse.json(
      { error: `Export hatası: ${errorMessage}` },
      { status: 500 }
    )
  }
}
