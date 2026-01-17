import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

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

interface DuckDuckGoResult {
  AbstractText?: string
  Abstract?: string
  RelatedTopics?: Array<{
    Text?: string
    FirstURL?: string
  }>
}

async function searchWikipedia(query: string): Promise<string | null> {
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`
    const searchResponse = await fetch(searchUrl)

    if (!searchResponse.ok) return null

    const searchData: WikiSearchResult = await searchResponse.json()
    const results = searchData.query?.search

    if (!results || results.length === 0) return null

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

async function searchDuckDuckGo(query: string): Promise<string | null> {
  try {
    // DuckDuckGo Instant Answer API (free, no key needed)
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`
    const response = await fetch(url)

    if (!response.ok) return null

    const data: DuckDuckGoResult = await response.json()

    // Try AbstractText first, then Abstract
    if (data.AbstractText && data.AbstractText.length > 50) {
      return data.AbstractText
    }

    if (data.Abstract && data.Abstract.length > 50) {
      return data.Abstract
    }

    // Try related topics
    if (data.RelatedTopics && data.RelatedTopics.length > 0) {
      const texts = data.RelatedTopics
        .filter(t => t.Text && t.Text.length > 20)
        .map(t => t.Text)
        .slice(0, 3)

      if (texts.length > 0) {
        return texts.join(' ')
      }
    }

    return null
  } catch {
    return null
  }
}

async function summarizeWithClaude(
  content: string,
  title: string,
  artist: string
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    // Fallback to basic summarization if no API key
    return basicSummarize(content, 100)
  }

  try {
    const client = new Anthropic({ apiKey })

    const response = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: `Based on the following information about the artwork "${title}" by ${artist}, write an engaging 2-3 sentence summary (about 80-100 words) that captures the story, significance, or interesting facts about this artwork or artist. Focus on what makes it compelling. Be concise and factual.

Information:
${content.slice(0, 2000)}

Write only the summary, no preamble.`
        }
      ]
    })

    const textBlock = response.content.find(block => block.type === 'text')
    return textBlock ? textBlock.text : basicSummarize(content, 100)
  } catch (error) {
    console.error('Claude API error:', error)
    return basicSummarize(content, 100)
  }
}

function basicSummarize(text: string, maxWords: number = 100): string {
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

  const artistName = artist && artist !== 'Unknown Artist' ? artist : ''

  // Search queries combining title and artist
  const searchQueries = [
    `${title} ${artistName} painting artwork`.trim(),
    `${title} ${artistName}`.trim(),
    `${title} artwork`,
    artistName ? `${artistName} artist painter` : null,
  ].filter(Boolean) as string[]

  let content: string | null = null
  let source = 'Wikipedia'

  // Try Wikipedia first
  for (const query of searchQueries) {
    content = await searchWikipedia(query)
    if (content && content.length > 100) break
  }

  // Fall back to web search if Wikipedia didn't have good results
  if (!content || content.length < 100) {
    for (const query of searchQueries) {
      content = await searchDuckDuckGo(query)
      if (content && content.length > 50) {
        source = 'Web'
        break
      }
    }
  }

  if (!content) {
    return NextResponse.json({
      summary: null,
      message: 'No additional information found for this artwork.',
    })
  }

  // Use Claude Haiku to create an engaging summary
  const summary = await summarizeWithClaude(content, title, artistName || 'Unknown Artist')

  return NextResponse.json({
    summary,
    source,
  })
}
