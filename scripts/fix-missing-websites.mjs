/**
 * Add website field to platforms that are missing it (currently falling back to apiBaseUrl)
 * Usage: pnpm node scripts/fix-missing-websites.mjs
 */

import { readFileSync, writeFileSync } from 'fs'

// Correct website URLs for platforms that don't have a website field yet
const FIXES = {
  'github': 'https://github.com',
  'gitlab': 'https://gitlab.com',
  'stackoverflow': 'https://stackoverflow.com',
  'kaggle': 'https://kaggle.com',
  'replit': 'https://replit.com',
  'hashnode': 'https://hashnode.com',
  'leetcode': 'https://leetcode.com',
  'hackerrank': 'https://hackerrank.com',
  'vercel': 'https://vercel.com',
  'netlify': 'https://netlify.com',
  'figma': 'https://figma.com',
  'dribbble': 'https://dribbble.com',
  'deviantart': 'https://deviantart.com',
  'sketchfab': 'https://sketchfab.com',
  'unsplash': 'https://unsplash.com',
  'flickr': 'https://flickr.com',
  '500px': 'https://500px.com',
  'wattpad': 'https://wattpad.com',
  'spotify': 'https://spotify.com',
  'soundcloud': 'https://soundcloud.com',
  'mixcloud': 'https://mixcloud.com',
  'deezer': 'https://deezer.com',
  'discogs': 'https://discogs.com',
  'blizzard': 'https://blizzard.com',
  'boardgamegeek': 'https://boardgamegeek.com',
  'myanimelist': 'https://myanimelist.net',
  'anilist': 'https://anilist.co',
  'trakt': 'https://trakt.tv',
  'rawg': 'https://rawg.io',
  'wallet-siwe': 'https://ethereum.org',
  'coinbase': 'https://coinbase.com',
  'strava': 'https://strava.com',
  'garmin': 'https://garmin.com',
  'polar': 'https://polar.com',
  'komoot': 'https://komoot.com',
  'fitbit': 'https://fitbit.com',
  'reddit': 'https://reddit.com',
  'discord': 'https://discord.com',
  'bluesky': 'https://bsky.app',
  'tumblr': 'https://tumblr.com',
  'pinterest': 'https://pinterest.com',
  'youtube': 'https://youtube.com',
  'twitch': 'https://twitch.tv',
  'vimeo': 'https://vimeo.com',
  'dailymotion': 'https://dailymotion.com',
  'producthunt': 'https://producthunt.com',
  'todoist': 'https://todoist.com',
  'untappd': 'https://untappd.com',
  'vivino': 'https://vivino.com',
  'yelp': 'https://yelp.com',
  'librarything': 'https://librarything.com',
  'feedly': 'https://feedly.com',
  'meetup': 'https://meetup.com',
  'eventbrite': 'https://eventbrite.com',
  'farcaster': 'https://warpcast.com',
  'mirror': 'https://mirror.xyz',
  'opensea': 'https://opensea.io',
}

let content = readFileSync('src/config/platformCatalog.ts', 'utf8')
let count = 0

for (const [id, website] of Object.entries(FIXES)) {
  const idStr = `id: "${id}"`
  const idPos = content.indexOf(idStr)
  if (idPos === -1) { console.log('NOT FOUND:', id); continue }

  const nearby = content.substring(idPos, idPos + 300)
  if (nearby.includes('website:')) { console.log('SKIP (already has):', id); continue }

  const authPos = content.indexOf('authType:', idPos)
  if (authPos === -1 || authPos > idPos + 300) { console.log('NO authType:', id); continue }

  const lineEnd = content.indexOf(',\n', authPos)
  if (lineEnd === -1) { console.log('NO lineEnd:', id); continue }

  const insertPos = lineEnd + 2
  content = content.slice(0, insertPos) + `    website: "${website}",\n` + content.slice(insertPos)
  count++
  console.log('ADDED:', id, '->', website)
}

writeFileSync('src/config/platformCatalog.ts', content)
console.log(`\nDone! Added website to ${count} platforms.`)
