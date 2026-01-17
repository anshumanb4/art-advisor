import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title')
  const artist = searchParams.get('artist')

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({
      summary: null,
      message: 'Story feature not configured.',
    })
  }

  const artistName = artist && artist !== 'Unknown Artist' ? artist : 'an unknown artist'

  try {
    const client = new Anthropic({ apiKey })

    const response = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: `What's the story behind "${title}" by ${artistName}? Write a concise, engaging 2-3 sentence response (about 80-100 words) focusing on the most interesting facts. If you don't know about this specific artwork, share what you know about the artist's style or the likely context. Be factual and informative.`
        }
      ]
    })

    const textBlock = response.content.find(block => block.type === 'text')
    const summary = textBlock?.text || null

    return NextResponse.json({
      summary,
      source: 'AI',
    })
  } catch (error) {
    console.error('Claude API error:', error)
    return NextResponse.json({
      summary: null,
      message: 'Unable to fetch story information.',
    })
  }
}
