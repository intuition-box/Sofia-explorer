/**
 * Create Platform Atoms + Category Atoms + "has tag" Triples on Intuition
 *
 * Usage:
 *   PRIVATE_KEY=0x... pnpm node scripts/create-platform-atoms.mjs
 *
 * Options:
 *   --dry-run     Pin to IPFS only, don't send transactions
 *   --skip-pin    Skip IPFS pinning (use cached pins from previous run)
 *   --batch=N     Batch size for createAtoms (default: 20)
 */

import { createPublicClient, createWalletClient, http, stringToHex, parseEther } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { readFileSync, writeFileSync, existsSync } from 'fs'

// ── Config ──

const RPC_URL = 'https://rpc.intuition.systems'
const GRAPHQL_URL = 'https://mainnet.intuition.sh/v1/graphql'
const SOFIA_FEE_PROXY = '0x26F81d723Ad1648194FAA4b7E235105Fd1212c6c'
const HAS_TAG_PREDICATE = '0x7ec36d201c842dc787b45cb5bb753bea4cf849be3908fb1b0a7d067c3c3cc1f5'
const CURVE_ID = 1n
const CACHE_FILE = 'scripts/.pin-cache.json'

// ── Chain definition (Intuition Mainnet — chain ID 1155, native token TRUST) ──

const intuitionChain = {
  id: 1155,
  name: 'Intuition Mainnet',
  network: 'intuition-mainnet',
  nativeCurrency: { name: 'Trust', symbol: 'TRUST', decimals: 18 },
  rpcUrls: { default: { http: [RPC_URL] } },
  blockExplorers: { default: { name: 'Explorer', url: 'https://explorer.intuition.systems' } },
}

// ── ABI (only what we need) ──

const PROXY_ABI = [
  {
    inputs: [],
    name: 'getAtomCost',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getTripleCost',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'depositCount', type: 'uint256' },
      { name: 'totalDeposit', type: 'uint256' },
      { name: 'multiVaultCost', type: 'uint256' },
    ],
    name: 'getTotalCreationCost',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'data', type: 'bytes' }],
    name: 'calculateAtomId',
    outputs: [{ type: 'bytes32' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      { name: 'receiver', type: 'address' },
      { name: 'data', type: 'bytes[]' },
      { name: 'assets', type: 'uint256[]' },
      { name: 'curveId', type: 'uint256' },
    ],
    name: 'createAtoms',
    outputs: [{ name: 'atomIds', type: 'bytes32[]' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'receiver', type: 'address' },
      { name: 'subjectIds', type: 'bytes32[]' },
      { name: 'predicateIds', type: 'bytes32[]' },
      { name: 'objectIds', type: 'bytes32[]' },
      { name: 'assets', type: 'uint256[]' },
      { name: 'curveId', type: 'uint256' },
    ],
    name: 'createTriples',
    outputs: [{ name: 'tripleIds', type: 'bytes32[]' }],
    stateMutability: 'payable',
    type: 'function',
  },
]

// ── Parse platform catalog ──

function parsePlatforms() {
  const content = readFileSync('src/config/platformCatalog.ts', 'utf8')
  const platforms = []
  // Match each platform block
  const idRegex = /id:\s*"([^"]+)"/g
  let match
  while ((match = idRegex.exec(content)) !== null) {
    const id = match[1]
    const pos = match.index
    const block = content.substring(pos, pos + 600)

    const nameMatch = block.match(/name:\s*"([^"]+)"/)
    const websiteMatch = block.match(/website:\s*"([^"]+)"/)
    const apiMatch = block.match(/apiBaseUrl:\s*"([^"]+)"/)
    const domainsMatch = block.match(/targetDomains:\s*\[([^\]]+)\]/)

    const name = nameMatch?.[1] || id
    let website = websiteMatch?.[1]
    if (!website && apiMatch) {
      try { website = `https://${new URL(apiMatch[1]).hostname}` } catch {}
    }
    if (!website) website = `https://${id}.com`

    const domains = domainsMatch?.[1]
      ?.match(/"([^"]+)"/g)
      ?.map((d) => d.replace(/"/g, '')) || []

    platforms.push({ id, name, website, domains })
  }
  return platforms
}

// ── Parse taxonomy for categories ──

function parseCategories() {
  // Our 14 domain categories
  return [
    { id: 'tech-dev', label: 'Tech & Dev' },
    { id: 'design-creative', label: 'Design & Visual Arts' },
    { id: 'music-audio', label: 'Music & Audio' },
    { id: 'gaming', label: 'Gaming' },
    { id: 'web3-crypto', label: 'Web3 & Crypto' },
    { id: 'science', label: 'Science & Knowledge' },
    { id: 'sport-health', label: 'Sport & Health' },
    { id: 'video-cinema', label: 'Video & Cinema' },
    { id: 'entrepreneurship', label: 'Entrepreneurship & Business' },
    { id: 'performing-arts', label: 'Performing Arts' },
    { id: 'nature-environment', label: 'Nature & Environment' },
    { id: 'food-lifestyle', label: 'Food, Fashion & Lifestyle' },
    { id: 'literature', label: 'Literature & Writing' },
    { id: 'personal-dev', label: 'Personal Development' },
  ]
}

// ── IPFS Pinning ──

async function pinThing({ name, description, image, url }) {
  const query = `mutation PinThing($name: String!, $description: String, $image: String, $url: String) {
    pinThing(thing: { name: $name, description: $description, image: $image, url: $url }) {
      uri
    }
  }`

  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      variables: { name, description: description || '', image: image || '', url: url || '' },
    }),
  })

  const json = await res.json()
  if (json.errors) throw new Error(`Pin failed for ${name}: ${JSON.stringify(json.errors)}`)
  const uri = json.data?.pinThing?.uri
  if (!uri) throw new Error(`No URI returned for ${name}`)
  return uri
}

// ── Cache management ──

function loadCache() {
  if (existsSync(CACHE_FILE)) {
    return JSON.parse(readFileSync(CACHE_FILE, 'utf8'))
  }
  return { pins: {}, atomIds: {}, tripleIds: {} }
}

function saveCache(cache) {
  writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2))
}

// ── Main ──

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const skipPin = args.includes('--skip-pin')
  const batchSize = parseInt(args.find((a) => a.startsWith('--batch='))?.split('=')[1] || '20')

  // Check private key
  const privateKey = process.env.PRIVATE_KEY
  if (!privateKey && !dryRun) {
    console.error('ERROR: Set PRIVATE_KEY environment variable (0x...)')
    console.error('Usage: PRIVATE_KEY=0x... pnpm node scripts/create-platform-atoms.mjs')
    process.exit(1)
  }

  const cache = loadCache()
  const platforms = parsePlatforms()
  const categories = parseCategories()

  console.log(`\n=== Sofia Platform Atom Creator ===`)
  console.log(`Platforms: ${platforms.length}`)
  console.log(`Categories: ${categories.length}`)
  console.log(`Batch size: ${batchSize}`)
  console.log(`Dry run: ${dryRun}`)
  console.log()

  // ── Step 1: Pin all atoms to IPFS ──

  if (!skipPin) {
    console.log('── Step 1: Pin to IPFS ──\n')

    // Pin categories
    for (const cat of categories) {
      const key = `cat:${cat.id}`
      if (cache.pins[key]) {
        console.log(`  CACHED ${cat.label}`)
        continue
      }
      try {
        const uri = await pinThing({
          name: cat.label,
          description: `Sofia category: ${cat.label}`,
          image: '',
          url: '',
        })
        cache.pins[key] = uri
        console.log(`  PINNED ${cat.label} → ${uri}`)
        saveCache(cache)
      } catch (e) {
        console.error(`  FAIL ${cat.label}: ${e.message}`)
      }
    }

    // Pin platforms
    for (const p of platforms) {
      const key = `platform:${p.id}`
      if (cache.pins[key]) {
        console.log(`  CACHED ${p.name}`)
        continue
      }
      try {
        const faviconUrl = existsSync(`public/favicons/${p.id}.png`)
          ? `https://sofia.explorer/favicons/${p.id}.png`
          : `https://www.google.com/s2/favicons?domain=${new URL(p.website).hostname}&sz=64`

        const uri = await pinThing({
          name: p.name,
          description: `Platform: ${p.name}`,
          image: faviconUrl,
          url: p.website,
        })
        cache.pins[key] = uri
        console.log(`  PINNED ${p.name} → ${uri}`)
        saveCache(cache)
      } catch (e) {
        console.error(`  FAIL ${p.name}: ${e.message}`)
      }
    }

    console.log(`\nPinned: ${Object.keys(cache.pins).length} total`)
  }

  if (dryRun) {
    console.log('\n── Dry run complete. Pins cached. Run without --dry-run to create atoms. ──')
    saveCache(cache)
    return
  }

  // ── Setup viem clients ──

  const account = privateKeyToAccount(privateKey)
  console.log(`\nWallet: ${account.address}`)

  const publicClient = createPublicClient({
    chain: intuitionChain,
    transport: http(RPC_URL),
  })

  const walletClient = createWalletClient({
    account,
    chain: intuitionChain,
    transport: http(RPC_URL),
  })

  // Get costs
  const atomCost = await publicClient.readContract({
    address: SOFIA_FEE_PROXY,
    abi: PROXY_ABI,
    functionName: 'getAtomCost',
  })

  const tripleCost = await publicClient.readContract({
    address: SOFIA_FEE_PROXY,
    abi: PROXY_ABI,
    functionName: 'getTripleCost',
  })

  console.log(`Atom cost: ${atomCost} wei`)
  console.log(`Triple cost: ${tripleCost} wei`)

  const balance = await publicClient.getBalance({ address: account.address })
  console.log(`Balance: ${balance} wei (${Number(balance) / 1e18} TRUST)`)

  // ── Cost estimate ──

  const totalAtoms = categories.length + platforms.length // 14 + 142 = 156
  const totalTriples = platforms.reduce((sum, p) => sum + p.domains.length, 0)

  const atomsTotalMultiVault = atomCost * BigInt(totalAtoms)
  const triplesTotalMultiVault = tripleCost * BigInt(totalTriples)

  const atomsTotalCost = await publicClient.readContract({
    address: SOFIA_FEE_PROXY,
    abi: PROXY_ABI,
    functionName: 'getTotalCreationCost',
    args: [0n, 0n, atomsTotalMultiVault],
  })

  const triplesTotalCost = await publicClient.readContract({
    address: SOFIA_FEE_PROXY,
    abi: PROXY_ABI,
    functionName: 'getTotalCreationCost',
    args: [0n, 0n, triplesTotalMultiVault],
  })

  const grandTotal = atomsTotalCost + triplesTotalCost

  console.log(`\n── Cost Estimate ──`)
  console.log(`  Atoms:   ${totalAtoms} × ${Number(atomCost) / 1e18} TRUST = ${Number(atomsTotalCost) / 1e18} TRUST (with fees)`)
  console.log(`  Triples: ${totalTriples} × ${Number(tripleCost) / 1e18} TRUST = ${Number(triplesTotalCost) / 1e18} TRUST (with fees)`)
  console.log(`  TOTAL:   ${Number(grandTotal) / 1e18} TRUST`)
  console.log(`  Balance: ${Number(balance) / 1e18} TRUST`)

  if (balance < grandTotal) {
    console.error(`\n  ⚠ NOT ENOUGH TRUST! Need ${Number(grandTotal - balance) / 1e18} more TRUST`)
  } else {
    console.log(`  ✓ Enough TRUST (${Number(balance - grandTotal) / 1e18} will remain)`)
  }

  if (args.includes('--estimate')) {
    console.log('\n── Estimate only. Run without --estimate to proceed. ──')
    return
  }

  // ── Step 2: Create atoms ──

  console.log('\n── Step 2: Create Atoms ──\n')

  // Collect all items to create (categories first, then platforms)
  const allItems = [
    ...categories.map((c) => ({ key: `cat:${c.id}`, name: c.label, type: 'category' })),
    ...platforms.map((p) => ({ key: `platform:${p.id}`, name: p.name, type: 'platform' })),
  ]

  // Filter to only items with pins and no atomId yet
  const toCreate = allItems.filter((item) => cache.pins[item.key] && !cache.atomIds[item.key])

  console.log(`To create: ${toCreate.length} atoms (${allItems.length - toCreate.length} already done)`)

  // Process in batches
  for (let i = 0; i < toCreate.length; i += batchSize) {
    const batch = toCreate.slice(i, i + batchSize)
    const encodedDataArray = batch.map((item) => stringToHex(cache.pins[item.key]))
    const depositsArray = batch.map(() => 0n)

    const multiVaultCost = atomCost * BigInt(batch.length)
    const totalCost = await publicClient.readContract({
      address: SOFIA_FEE_PROXY,
      abi: PROXY_ABI,
      functionName: 'getTotalCreationCost',
      args: [0n, 0n, multiVaultCost],
    })

    console.log(`\n  Batch ${Math.floor(i / batchSize) + 1}: ${batch.length} atoms, cost: ${totalCost} wei`)
    batch.forEach((item) => console.log(`    - ${item.name} (${item.type})`))

    try {
      // Simulate first
      const { result } = await publicClient.simulateContract({
        address: SOFIA_FEE_PROXY,
        abi: PROXY_ABI,
        functionName: 'createAtoms',
        args: [account.address, encodedDataArray, depositsArray, CURVE_ID],
        value: totalCost,
        account,
      })

      const atomIds = result

      // Execute
      const txHash = await walletClient.writeContract({
        address: SOFIA_FEE_PROXY,
        abi: PROXY_ABI,
        functionName: 'createAtoms',
        args: [account.address, encodedDataArray, depositsArray, CURVE_ID],
        value: totalCost,
      })

      console.log(`  TX: ${txHash}`)

      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash })

      if (receipt.status !== 'success') {
        console.error(`  TX FAILED: ${receipt.status}`)
        continue
      }

      // Save atom IDs
      for (let j = 0; j < batch.length; j++) {
        cache.atomIds[batch[j].key] = atomIds[j]
        console.log(`  CREATED ${batch[j].name} → ${atomIds[j]}`)
      }
      saveCache(cache)

    } catch (e) {
      const msg = e.message || ''
      if (msg.includes('AtomExists')) {
        // Fallback: create one by one
        console.log(`  Some atoms exist, falling back to individual creation...`)
        for (const item of batch) {
          if (cache.atomIds[item.key]) continue
          const encoded = stringToHex(cache.pins[item.key])

          try {
            // Check if it already exists
            const atomId = await publicClient.readContract({
              address: SOFIA_FEE_PROXY,
              abi: PROXY_ABI,
              functionName: 'calculateAtomId',
              args: [encoded],
            })

            // Try to simulate - if AtomExists, we'll catch it
            const singleCost = await publicClient.readContract({
              address: SOFIA_FEE_PROXY,
              abi: PROXY_ABI,
              functionName: 'getTotalCreationCost',
              args: [0n, 0n, atomCost],
            })

            try {
              const { result } = await publicClient.simulateContract({
                address: SOFIA_FEE_PROXY,
                abi: PROXY_ABI,
                functionName: 'createAtoms',
                args: [account.address, [encoded], [0n], CURVE_ID],
                value: singleCost,
                account,
              })

              const txHash = await walletClient.writeContract({
                address: SOFIA_FEE_PROXY,
                abi: PROXY_ABI,
                functionName: 'createAtoms',
                args: [account.address, [encoded], [0n], CURVE_ID],
                value: singleCost,
              })

              await publicClient.waitForTransactionReceipt({ hash: txHash })
              cache.atomIds[item.key] = result[0]
              console.log(`    CREATED ${item.name} → ${result[0]}`)
            } catch (singleErr) {
              if (singleErr.message?.includes('AtomExists')) {
                cache.atomIds[item.key] = atomId
                console.log(`    EXISTS ${item.name} → ${atomId}`)
              } else {
                console.error(`    FAIL ${item.name}: ${singleErr.message}`)
              }
            }
            saveCache(cache)
          } catch (calcErr) {
            console.error(`    FAIL ${item.name}: ${calcErr.message}`)
          }
        }
      } else {
        console.error(`  BATCH FAIL: ${msg}`)
      }
    }
  }

  // ── Step 3: Create triples ──

  console.log('\n── Step 3: Create "has tag" Triples ──\n')

  // Build all triples: [platform] has tag [category]
  const triples = []
  for (const p of platforms) {
    const platformAtomId = cache.atomIds[`platform:${p.id}`]
    if (!platformAtomId) {
      console.log(`  SKIP ${p.name} (no atom ID)`)
      continue
    }

    for (const domainId of p.domains) {
      const categoryAtomId = cache.atomIds[`cat:${domainId}`]
      if (!categoryAtomId) {
        console.log(`  SKIP ${p.name} → ${domainId} (no category atom)`)
        continue
      }

      const tripleKey = `${p.id}:${domainId}`
      if (cache.tripleIds[tripleKey]) continue

      triples.push({
        key: tripleKey,
        platformName: p.name,
        domainId,
        subjectId: platformAtomId,
        predicateId: HAS_TAG_PREDICATE,
        objectId: categoryAtomId,
      })
    }
  }

  console.log(`Triples to create: ${triples.length}`)

  // Process in batches
  for (let i = 0; i < triples.length; i += batchSize) {
    const batch = triples.slice(i, i + batchSize)

    const subjectIds = batch.map((t) => t.subjectId)
    const predicateIds = batch.map(() => HAS_TAG_PREDICATE)
    const objectIds = batch.map((t) => t.objectId)
    const deposits = batch.map(() => 0n)

    const multiVaultCost = tripleCost * BigInt(batch.length)
    const totalCost = await publicClient.readContract({
      address: SOFIA_FEE_PROXY,
      abi: PROXY_ABI,
      functionName: 'getTotalCreationCost',
      args: [0n, 0n, multiVaultCost],
    })

    console.log(`\n  Batch ${Math.floor(i / batchSize) + 1}: ${batch.length} triples, cost: ${totalCost} wei`)

    try {
      const { result } = await publicClient.simulateContract({
        address: SOFIA_FEE_PROXY,
        abi: PROXY_ABI,
        functionName: 'createTriples',
        args: [account.address, subjectIds, predicateIds, objectIds, deposits, CURVE_ID],
        value: totalCost,
        account,
      })

      const txHash = await walletClient.writeContract({
        address: SOFIA_FEE_PROXY,
        abi: PROXY_ABI,
        functionName: 'createTriples',
        args: [account.address, subjectIds, predicateIds, objectIds, deposits, CURVE_ID],
        value: totalCost,
      })

      console.log(`  TX: ${txHash}`)

      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash })

      if (receipt.status !== 'success') {
        console.error(`  TX FAILED`)
        continue
      }

      for (let j = 0; j < batch.length; j++) {
        cache.tripleIds[batch[j].key] = result[j]
        console.log(`  CREATED ${batch[j].platformName} has tag ${batch[j].domainId} → ${result[j]}`)
      }
      saveCache(cache)

    } catch (e) {
      console.error(`  BATCH FAIL: ${e.message?.slice(0, 200)}`)
      // Fallback: create triples one by one
      for (const triple of batch) {
        if (cache.tripleIds[triple.key]) continue
        try {
          const singleCost = await publicClient.readContract({
            address: SOFIA_FEE_PROXY,
            abi: PROXY_ABI,
            functionName: 'getTotalCreationCost',
            args: [0n, 0n, tripleCost],
          })

          const { result } = await publicClient.simulateContract({
            address: SOFIA_FEE_PROXY,
            abi: PROXY_ABI,
            functionName: 'createTriples',
            args: [account.address, [triple.subjectId], [HAS_TAG_PREDICATE], [triple.objectId], [0n], CURVE_ID],
            value: singleCost,
            account,
          })

          const txHash = await walletClient.writeContract({
            address: SOFIA_FEE_PROXY,
            abi: PROXY_ABI,
            functionName: 'createTriples',
            args: [account.address, [triple.subjectId], [HAS_TAG_PREDICATE], [triple.objectId], [0n], CURVE_ID],
            value: singleCost,
          })

          await publicClient.waitForTransactionReceipt({ hash: txHash })
          cache.tripleIds[triple.key] = result[0]
          console.log(`    CREATED ${triple.platformName} has tag ${triple.domainId}`)
          saveCache(cache)
        } catch (singleErr) {
          if (singleErr.message?.includes('TripleExists')) {
            console.log(`    EXISTS ${triple.platformName} has tag ${triple.domainId}`)
            cache.tripleIds[triple.key] = 'existing'
            saveCache(cache)
          } else {
            console.error(`    FAIL ${triple.platformName} has tag ${triple.domainId}: ${singleErr.message?.slice(0, 100)}`)
          }
        }
      }
    }
  }

  // ── Summary ──

  console.log('\n=== Summary ===')
  console.log(`Atoms created: ${Object.keys(cache.atomIds).length}`)
  console.log(`Triples created: ${Object.keys(cache.tripleIds).length}`)
  console.log(`Cache saved to: ${CACHE_FILE}`)
}

main().catch((e) => {
  console.error('\nFATAL:', e.message)
  process.exit(1)
})
