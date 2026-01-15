import { google } from 'googleapis'

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

function getAuth() {
  const credentials = process.env.GOOGLE_SHEETS_CREDENTIALS
  if (!credentials) {
    throw new Error('GOOGLE_SHEETS_CREDENTIALS not set')
  }

  const parsed = JSON.parse(credentials)

  return new google.auth.GoogleAuth({
    credentials: parsed,
    scopes: SCOPES,
  })
}

export async function appendToSheet(
  spreadsheetId: string,
  values: string[][]
) {
  const auth = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Sheet1!A:D',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values,
    },
  })
}

export async function logArtworkLike(
  userIdentifier: string,
  artworkId: string,
  artworkTitle: string,
  sourceUrl: string
) {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID
  if (!spreadsheetId) {
    console.warn('GOOGLE_SHEET_ID not set, skipping sheet log')
    return
  }

  try {
    const timestamp = new Date().toISOString()
    await appendToSheet(spreadsheetId, [
      [userIdentifier, artworkTitle, sourceUrl, timestamp]
    ])
  } catch (error) {
    console.error('Error logging to sheet:', error)
    // Don't throw - we don't want to break the like flow
  }
}
