import { NextResponse } from 'next/server'

interface WikiSearchResult {
  query?: {
    search?: Array<{
      title: string
      snippet: string
      pageid: number
    }>
  }
}

interface WikiPageResult {
  query?: {
    pages?: {
      [key: string]: {
        pageid: number
        title: string
        extract?: string
      }
    }
  }
}

async function searchWikipedia(query: string): Promise<string | null> {
  try {
    // First, search for the query
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`
    const searchResponse = await fetch(searchUrl)

    if (!searchResponse.ok) return null

    const searchData: WikiSearchResult = await searchResponse.json()
    const results = searchData.query?.search

    if (!results || results.length === 0) return null

    // Get the first result's page content
    const pageId = results[0].pageid
    const pageUrl = `https://en.wikipedia.org/w/api.php?action=query&pageids=${pageId}&prop=extracts&exintro=true&explaintext=true&format=json&origin=*`

    const pageResponse = await fetch(pageUrl)
    if (!pageResponse.ok) return null

    const pageData: WikiPageResult = await pageResponse.json()
    const pages = pageData.query?.pages

    if (!pages) return null

    const page = pages[pageId.toString()]
    return page?.extract || null
  } catch {
    return null
  }
}

function summarizeText(text: string, maxWords: number = 100): string {
  // Split into sentences
  const sentences = text.split(/(?<=[.!?])\s+/)

  let summary = ''
  let wordCount = 0

  for (const sentence of sentences) {
    const sentenceWords = sentence.split(/\s+/).length

    if (wordCount + sentenceWords <= maxWords) {
      summary += sentence + ' '
      wordCount += sentenceWords
    } else {
      break
    }
  }

  return summary.trim()
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title')
  const artist = searchParams.get('artist')

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }

  // Try multiple search strategies
  const searchQueries = [
    `${title} ${artist} painting artwork`,
    `${title} artwork`,
    `${title} ${artist}`,
    artist && artist !== 'Unknown Artist' ? `${artist} artist` : null,
  ].filter(Boolean) as string[]

  let content: string | null = null

  for (const query of searchQueries) {
    content = await searchWikipedia(query)
    if (content && content.length > 100) break
  }

  if (!content) {
    return NextResponse.json({
      summary: null,
      message: 'No additional information found for this artwork.',
    })
  }

  // Create a ~100 word summary
  const summary = summarizeText(content, 100)

  return NextResponse.json({
    summary,
    source: 'Wikipedia',
  })
}
