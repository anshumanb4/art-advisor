import { Artwork } from '../types'

const NYPL_API_BASE = 'https://api.repo.nypl.org/api/v2'

interface NYPLImageLink {
  $: string
}

interface NYPLCapture {
  uuid: string
  imageLinks?: {
    imageLink?: NYPLImageLink[]
  }
  title?: string
}

interface NYPLItem {
  uuid: string
  title?: string
  dateDigitized?: string
  rightsStatement?: string
}

interface NYPLMods {
  titleInfo?: { title?: { $: string } }
  name?: { namePart?: { $: string } }[] | { namePart?: { $: string } }
  originInfo?: { dateCreated?: { $: string } }
  physicalDescription?: { form?: { $: string }; extent?: { $: string } }
  note?: { $: string }[] | { $: string }
  subject?: { topic?: { $: string } }[]
}

interface NYPLSearchResult {
  uuid: string
  title: string
  imageID?: string
}

interface NYPLSearchResponse {
  nyplAPI: {
    response: {
      result?: NYPLSearchResult[]
      numResults?: string
    }
  }
}

interface NYPLItemResponse {
  nyplAPI: {
    response: {
      capture?: NYPLCapture[]
    }
  }
}

interface NYPLModsResponse {
  nyplAPI: {
    response: {
      mods?: NYPLMods
    }
  }
}

const SEARCH_QUERIES = [
  'painting',
  'photograph',
  'portrait',
  'landscape',
  'poster',
  'illustration',
  'print',
  'drawing',
]

function getAuthHeader(token: string): HeadersInit {
  return {
    'Authorization': `Token token="${token}"`,
  }
}

export async function fetchNYPLArtworks(count: number = 20): Promise<Artwork[]> {
  const apiToken = process.env.NYPL_API_TOKEN
  if (!apiToken) {
    console.warn('NYPL_API_TOKEN not set, skipping NYPL')
    return []
  }

  const artworks: Artwork[] = []
  const query = SEARCH_QUERIES[Math.floor(Math.random() * SEARCH_QUERIES.length)]

  try {
    // Search for items with images in public domain
    const response = await fetch(
      `${NYPL_API_BASE}/items/search?q=${encodeURIComponent(query)}&publicDomainOnly=true&per_page=${count}&page=${Math.floor(Math.random() * 10) + 1}`,
      { headers: getAuthHeader(apiToken) }
    )

    if (!response.ok) return artworks

    const data: NYPLSearchResponse = await response.json()
    const results = data.nyplAPI?.response?.result

    if (!results) return artworks

    // Fetch details for each item
    for (const item of results.slice(0, count)) {
      try {
        // Get capture info for image
        const captureRes = await fetch(
          `${NYPL_API_BASE}/items/${item.uuid}`,
          { headers: getAuthHeader(apiToken) }
        )

        if (!captureRes.ok) continue

        const captureData: NYPLItemResponse = await captureRes.json()
        const capture = captureData.nyplAPI?.response?.capture?.[0]

        if (!capture?.imageLinks?.imageLink) continue

        // Find a good sized image (prefer medium/large)
        const imageLinks = capture.imageLinks.imageLink
        const imageUrl = imageLinks.find(l => l.$.includes('&t=w'))?.$ ||
                        imageLinks.find(l => l.$.includes('&t=r'))?.$ ||
                        imageLinks[0]?.$

        if (!imageUrl) continue

        // Get MODS metadata for more details
        let artist = 'Unknown Artist'
        let year = 'Date unknown'
        let medium = 'Unknown medium'
        let description: string | undefined

        try {
          const modsRes = await fetch(
            `${NYPL_API_BASE}/mods/${item.uuid}`,
            { headers: getAuthHeader(apiToken) }
          )

          if (modsRes.ok) {
            const modsData: NYPLModsResponse = await modsRes.json()
            const mods = modsData.nyplAPI?.response?.mods

            if (mods) {
              // Get artist
              if (Array.isArray(mods.name)) {
                artist = mods.name[0]?.namePart?.$ || artist
              } else if (mods.name?.namePart?.$) {
                artist = mods.name.namePart.$
              }

              // Get year
              if (mods.originInfo?.dateCreated?.$) {
                year = mods.originInfo.dateCreated.$
              }

              // Get medium
              if (mods.physicalDescription?.form?.$) {
                medium = mods.physicalDescription.form.$
              }

              // Get description
              if (Array.isArray(mods.note)) {
                description = mods.note[0]?.$
              } else if (mods.note?.$) {
                description = mods.note.$
              }
            }
          }
        } catch {
          // Continue with defaults if MODS fetch fails
        }

        artworks.push({
          id: `nypl-${item.uuid}`,
          title: item.title || capture.title || 'Untitled',
          artist,
          year,
          medium,
          imageUrl,
          thumbnailUrl: imageLinks.find(l => l.$.includes('&t=t'))?.$ || imageUrl,
          source: 'nypl',
          sourceUrl: `https://digitalcollections.nypl.org/items/${item.uuid}`,
          description,
        })

        // Rate limiting - don't hammer the API
        if (artworks.length >= count) break
      } catch {
        continue
      }
    }
  } catch (error) {
    console.error('Error fetching from NYPL:', error)
  }

  return artworks
}
