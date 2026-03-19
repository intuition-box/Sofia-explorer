/**
 * Sofia Taxonomy — 14 Domains x 88 Categories x 300+ Niches
 * Source: docs/prompt/sofia_taxonomy.xlsx
 * Single source of truth for behavioral reputation domains
 */

import type { Domain } from "../types/reputation"

export const SOFIA_DOMAINS: Domain[] = [
  // =========================================================================
  // 1. TECH & DEV
  // =========================================================================
  {
    id: "tech-dev",
    label: "Tech & Dev",
    icon: "keyboard",
    color: "#4472C4",
    primaryPlatforms: [
      "github",
      "stackoverflow",
      "huggingface",
      "leetcode",
      "npm",
    ],
    categories: [
      {
        id: "web-development",
        label: "Web Development",
        niches: [
          {
            id: "frontend",
            label: "Frontend (React, Vue, Svelte)",
            disambiguationSignal:
              "Daily commit pattern (GitHub streak)",
            disambiguationResult: "Active dev vs hobbyist",
          },
          {
            id: "backend",
            label: "Backend (Node, Python, Go)",
          },
          {
            id: "fullstack",
            label: "Fullstack & Architecture",
          },
          {
            id: "web-performance",
            label: "Web Performance & SEO",
          },
        ],
      },
      {
        id: "mobile-dev",
        label: "Mobile Dev",
        niches: [
          { id: "ios-swift", label: "iOS / Swift" },
          { id: "android-kotlin", label: "Android / Kotlin" },
          {
            id: "react-native-flutter",
            label: "React Native / Flutter",
          },
          { id: "pwa", label: "Progressive Web Apps" },
        ],
      },
      {
        id: "ai-ml",
        label: "AI / Machine Learning",
        niches: [
          {
            id: "ai-research",
            label: "Research & Papers (LLMs)",
            disambiguationSignal:
              "Hugging Face published models",
            disambiguationResult:
              "AI/ML vs classic web dev",
          },
          {
            id: "applied-ai",
            label: "Applied AI (fine-tuning, RAG)",
          },
          { id: "prompt-engineering", label: "Prompt Engineering" },
          { id: "mlops", label: "MLOps & Infra" },
        ],
      },
      {
        id: "devops-cloud",
        label: "DevOps & Cloud",
        niches: [
          {
            id: "kubernetes-docker",
            label: "Kubernetes & Docker",
            disambiguationSignal:
              "Stack Overflow dominant tags",
            disambiguationResult:
              "Exact language / ecosystem",
          },
          { id: "cicd-gitops", label: "CI/CD & GitOps" },
          { id: "aws-gcp-azure", label: "AWS / GCP / Azure" },
          { id: "serverless-edge", label: "Serverless & Edge" },
        ],
      },
      {
        id: "cybersecurity",
        label: "Cybersecurity",
        niches: [
          {
            id: "ethical-hacking",
            label: "Ethical hacking & CTF",
          },
          { id: "privacy-opsec", label: "Privacy & OPSEC" },
          { id: "cryptography", label: "Cryptography" },
          { id: "bug-bounty", label: "Bug bounty" },
        ],
      },
      {
        id: "open-source",
        label: "Open Source",
        niches: [
          {
            id: "oss-contributor",
            label: "Active contributor",
            disambiguationSignal:
              "Dominant repos: frontend vs backend vs infra",
            disambiguationResult:
              "Precise tech specialization",
          },
          { id: "oss-maintainer", label: "Project maintainer" },
          { id: "oss-docs", label: "Documentation" },
          {
            id: "oss-business",
            label: "OSS Business model",
          },
        ],
      },
      {
        id: "hardware-iot",
        label: "Hardware & IoT",
        niches: [
          {
            id: "arduino-rpi",
            label: "Arduino / Raspberry Pi",
          },
          { id: "embedded", label: "Embedded systems" },
          { id: "domotique", label: "Home automation" },
          { id: "robotique", label: "Robotics" },
        ],
      },
      {
        id: "lowcode-nocode",
        label: "Low-code / No-code",
        niches: [
          { id: "bubble-webflow", label: "Bubble, Webflow" },
          {
            id: "airtable-automation",
            label: "Airtable & Automation",
          },
          { id: "zapier-make", label: "Zapier / Make" },
          { id: "internal-tools", label: "Internal tools" },
        ],
      },
    ],
  },

  // =========================================================================
  // 2. DESIGN & VISUAL ARTS
  // =========================================================================
  {
    id: "design-creative",
    label: "Design & Visual Arts",
    icon: "palette",
    color: "#E06C75",
    primaryPlatforms: [
      "figma",
      "behance",
      "dribbble",
      "sketchfab",
      "flickr",
    ],
    categories: [
      {
        id: "ui-ux-design",
        label: "UI/UX Design",
        niches: [
          {
            id: "product-design",
            label: "Product design",
            disambiguationSignal:
              "Figma: wireframe vs illustrations vs prototypes",
            disambiguationResult:
              "UX designer vs illustrator vs product",
          },
          { id: "design-system", label: "Design system" },
          { id: "prototyping", label: "Prototyping (Figma)" },
          { id: "user-research", label: "User research" },
        ],
      },
      {
        id: "illustration",
        label: "Illustration & Digital Art",
        niches: [
          {
            id: "concept-art",
            label: "Concept art",
            disambiguationSignal:
              "Behance: published project categories",
            disambiguationResult: "Exact specialization",
          },
          { id: "character-design", label: "Character design" },
          { id: "pixel-art", label: "Pixel art" },
          { id: "generative-art", label: "Generative art" },
        ],
      },
      {
        id: "motion-design",
        label: "Motion Design",
        niches: [
          {
            id: "after-effects",
            label: "After Effects",
            disambiguationSignal:
              "Adobe CC: dominant apps (Ps vs Ai vs Pr vs Ae)",
            disambiguationResult:
              "Photo vs illustration vs video vs motion",
          },
          {
            id: "lottie-web-animation",
            label: "Lottie / Web animation",
          },
          { id: "3d-motion", label: "3D motion" },
          { id: "vfx", label: "VFX" },
        ],
      },
      {
        id: "graphic-design",
        label: "Graphic Design",
        niches: [
          {
            id: "branding",
            label: "Branding & Identity",
            disambiguationSignal:
              "ArtStation + Steam active simultaneously",
            disambiguationResult:
              "Very likely gaming concept artist",
          },
          { id: "typography", label: "Typography" },
          { id: "print-edition", label: "Print & Publishing" },
          { id: "packaging", label: "Packaging" },
        ],
      },
      {
        id: "3d-modeling",
        label: "3D & Modeling",
        niches: [
          { id: "blender", label: "Blender" },
          { id: "cinema4d-maya", label: "Cinema 4D / Maya" },
          { id: "game-assets", label: "Game assets" },
          { id: "architecture-3d", label: "Architecture 3D" },
        ],
      },
      {
        id: "photography",
        label: "Photography",
        niches: [
          { id: "portrait-photo", label: "Portrait" },
          { id: "landscape-photo", label: "Landscape & Nature" },
          { id: "street-photo", label: "Street photography" },
          { id: "studio-product", label: "Studio & Product" },
        ],
      },
      {
        id: "fashion-textile",
        label: "Fashion & Textile",
        niches: [
          { id: "fashion-design", label: "Fashion design" },
          {
            id: "embroidery-sewing",
            label: "Embroidery & Sewing",
          },
          { id: "streetwear-design", label: "Streetwear" },
          {
            id: "vintage-upcycling",
            label: "Vintage & upcycling",
          },
        ],
      },
    ],
  },

  // =========================================================================
  // 3. MUSIC & AUDIO
  // =========================================================================
  {
    id: "music-audio",
    label: "Music & Audio",
    icon: "music",
    color: "#61AFEF",
    primaryPlatforms: [
      "soundcloud",
      "mixcloud",
      "discogs",
      "lastfm",
      "listenbrainz",
    ],
    categories: [
      {
        id: "music-production",
        label: "Music Production",
        niches: [
          {
            id: "beatmaking",
            label: "Beatmaking (hip-hop, trap)",
            disambiguationSignal:
              "SoundCloud uploaded tracks + genre tags",
            disambiguationResult:
              "Exact production genre",
          },
          {
            id: "electronic-production",
            label: "Electronic (techno, house, ambient)",
          },
          {
            id: "sampling-crates",
            label: "Sampling & crates",
          },
          {
            id: "orchestral-composition",
            label: "Orchestral composition",
          },
        ],
      },
      {
        id: "djing",
        label: "DJing",
        niches: [
          {
            id: "psytrance-goa",
            label: "Psytrance / Goa",
            disambiguationSignal:
              "Mixcloud uploaded sets + average duration (1h+)",
            disambiguationResult:
              "DJ vs beatmaker vs passive listener",
          },
          {
            id: "techno-industrial",
            label: "Techno & Industrial",
          },
          { id: "house-disco", label: "House & Disco" },
          { id: "dnb-jungle", label: "Drum & Bass / Jungle" },
          {
            id: "hiphop-turntablism",
            label: "Hip-hop & Turntablism",
          },
        ],
      },
      {
        id: "instrumentist",
        label: "Instrumentalist",
        niches: [
          {
            id: "guitar",
            label: "Guitar (rock, jazz, classical)",
            disambiguationSignal:
              "Beatport purchases by genre over rolling 6 months",
            disambiguationResult:
              "Ultra-precise DJ specialization",
          },
          { id: "piano-keys", label: "Piano & Keyboards" },
          { id: "bass", label: "Bass" },
          {
            id: "drums-percussion",
            label: "Percussion & Drums",
          },
        ],
      },
      {
        id: "vocals",
        label: "Vocals & Voice",
        niches: [
          {
            id: "classical-vocal",
            label: "Classical / Lyrical singing",
            disambiguationSignal:
              "Last.fm top artists + tags = passion vs occasional curiosity",
            disambiguationResult:
              "Lasting passion vs exploration",
          },
          { id: "pop-rnb-vocal", label: "Pop & R&B" },
          { id: "rap-spoken-word", label: "Rap & spoken word" },
          { id: "acapella-chorale", label: "A cappella & Choir" },
        ],
      },
      {
        id: "sound-design",
        label: "Sound Design & Audio Eng.",
        niches: [
          { id: "mixing-mastering", label: "Mixing & Mastering" },
          { id: "foley-sfx", label: "Foley & SFX" },
          { id: "field-recording", label: "Field recording" },
          {
            id: "game-film-music",
            label: "Music for games/films",
          },
        ],
      },
      {
        id: "music-theory",
        label: "Music Theory",
        niches: [
          {
            id: "harmony-counterpoint",
            label: "Harmony & Counterpoint",
          },
          {
            id: "contemporary-composition",
            label: "Contemporary composition",
          },
          { id: "jazz-theory", label: "Jazz theory" },
          { id: "microtonality", label: "Microtonality" },
        ],
      },
      {
        id: "music-collecting",
        label: "Collecting",
        niches: [
          { id: "vinyl-collecting", label: "Vinyl records" },
          { id: "cassette-collecting", label: "Cassettes & Tapes" },
          {
            id: "limited-editions",
            label: "Limited editions",
          },
          {
            id: "vintage-instruments",
            label: "Instruments vintage",
          },
        ],
      },
      {
        id: "music-culture",
        label: "Music Criticism & Culture",
        niches: [
          {
            id: "music-journalism",
            label: "Music journalism",
          },
          {
            id: "curation-playlisting",
            label: "Curation & playlisting",
          },
          { id: "music-blogging", label: "Blogging" },
          { id: "genre-history", label: "History of genres" },
        ],
      },
    ],
  },

  // =========================================================================
  // 4. GAMING
  // =========================================================================
  {
    id: "gaming",
    label: "Gaming",
    icon: "gamepad",
    color: "#C678DD",
    primaryPlatforms: [
      "chess-com",
      "lichess",
      "riot-games",
      "steam",
      "opendota",
    ],
    categories: [
      {
        id: "strategy-puzzle",
        label: "Puzzle & Strategy Games",
        niches: [
          {
            id: "chess",
            label: "Chess (Elo rating)",
            disambiguationSignal:
              "Chess.com Elo > 1500 + daily streak",
            disambiguationResult:
              "Strategic intellectual ≠ classic gamer",
          },
          { id: "go-shogi", label: "Go / Shogi" },
          { id: "board-games", label: "Board games" },
          { id: "puzzles", label: "Puzzles & Brain teasers" },
        ],
      },
      {
        id: "fps-competitive",
        label: "FPS / TPS Competitive",
        niches: [
          {
            id: "valorant-csgo",
            label: "Valorant / CSGO",
            disambiguationSignal:
              "Steam: 80% hours on 1 genre = specialist",
            disambiguationResult:
              "Hardcore vs casual gamer",
          },
          {
            id: "apex-warzone",
            label: "Apex Legends / Warzone",
          },
          { id: "rainbow-six", label: "Rainbow Six Siege" },
          { id: "overwatch", label: "Overwatch" },
        ],
      },
      {
        id: "rpg-narrative",
        label: "RPG & Narrative",
        niches: [
          {
            id: "action-rpg",
            label: "Action-RPG (Elden Ring, Zelda)",
            disambiguationSignal:
              "Twitch streams: games by dominant category",
            disambiguationResult: "Exact dominant genre",
          },
          {
            id: "jrpg",
            label: "JRPG (Final Fantasy)",
          },
          { id: "story-games", label: "Story games" },
          { id: "metroidvania", label: "Metroidvania" },
        ],
      },
      {
        id: "strategy-4x",
        label: "Strategy & 4X",
        niches: [
          {
            id: "civilization",
            label: "Civilization",
            disambiguationSignal:
              "Subreddit r/chess vs r/patientgamers vs r/VALORANT",
            disambiguationResult:
              "Precise gaming subculture",
          },
          { id: "rts-starcraft", label: "StarCraft / RTS" },
          { id: "total-war", label: "Total War" },
          {
            id: "grand-strategy",
            label: "Grand strategy (CK3, EU4)",
          },
        ],
      },
      {
        id: "sports-games",
        label: "Virtual Sports",
        niches: [
          { id: "fifa-fc", label: "Football (FIFA / FC)" },
          { id: "f1-racing", label: "F1 & Racing sims" },
          { id: "nba2k", label: "Basketball (NBA2K)" },
          { id: "golf-tennis-games", label: "Golf / Tennis" },
        ],
      },
      {
        id: "indie-art-games",
        label: "Indie & Art games",
        niches: [
          { id: "auteur-games", label: "Auteur games" },
          { id: "pixel-indie", label: "Pixel art indie" },
          {
            id: "narrative-experiences",
            label: "Narrative experiences",
          },
          { id: "game-jams", label: "Game jams" },
        ],
      },
      {
        id: "mmo-social",
        label: "MMO & Social gaming",
        niches: [
          { id: "wow", label: "World of Warcraft" },
          { id: "ffxiv", label: "Final Fantasy XIV" },
          {
            id: "guild-community",
            label: "Guild & Community",
          },
          { id: "ingame-economy", label: "In-game economy" },
        ],
      },
      {
        id: "retro-collecting",
        label: "Retro & Collecting",
        niches: [
          { id: "emulation", label: "Emulation" },
          { id: "speedrunning", label: "Speedrunning" },
          {
            id: "physical-collecting",
            label: "Physical collections",
          },
          { id: "arcade", label: "Arcade & Cabinets" },
        ],
      },
    ],
  },

  // =========================================================================
  // 5. WEB3 & CRYPTO
  // =========================================================================
  {
    id: "web3-crypto",
    label: "Web3 & Crypto",
    icon: "link",
    color: "#627EEA",
    primaryPlatforms: [
      "wallet-siwe",
      "the-graph",
      "lens",
      "farcaster",
      "snapshot",
    ],
    categories: [
      {
        id: "defi",
        label: "DeFi",
        termId: "0x31d170b3efaa2820d0d6b0c53c7232618ec74495871ed32907a1c9028ce78a8c",
        niches: [
          {
            id: "yield-farming",
            label: "Yield farming & liquidity",
            disambiguationSignal:
              "On-chain: interacted protocols (Aave vs OpenSea vs Uniswap)",
            disambiguationResult:
              "DeFi vs NFT collector vs DEX trader",
          },
          {
            id: "lending",
            label: "Lending (Aave, Compound)",
          },
          { id: "dex-amm", label: "DEX & AMM (Uniswap)" },
          { id: "lsd-restaking", label: "LSD & restaking" },
        ],
      },
      {
        id: "nft-art",
        label: "NFT & Digital Art",
        niches: [
          {
            id: "nft-collecting",
            label: "Collecting",
            disambiguationSignal:
              "Held tokens: ETH heavy vs BTC only vs diversified altcoin",
            disambiguationResult:
              "Exact ideological profile",
          },
          { id: "nft-creation", label: "Creation / minting" },
          {
            id: "generative-nft",
            label: "Generative (Art Blocks)",
          },
          { id: "pfp-communities", label: "PFP communities" },
        ],
      },
      {
        id: "trading-speculation",
        label: "Trading & Speculation",
        niches: [
          {
            id: "altcoins-gems",
            label: "Altcoins & gems",
            disambiguationSignal:
              "Lens/Farcaster activity vs DeFi wallet only",
            disambiguationResult:
              "Web3 social vs finance only",
          },
          { id: "memecoins", label: "Memecoins" },
          {
            id: "onchain-analysis",
            label: "On-chain analysis",
          },
          { id: "futures-perps", label: "Futures & perps" },
        ],
      },
      {
        id: "btc-maximalism",
        label: "Bitcoin Maximalism",
        niches: [
          {
            id: "lightning-network",
            label: "Lightning Network",
            disambiguationSignal:
              "ENS + Lens + Farcaster vs wallet dormant",
            disambiguationResult:
              "Engaged OG vs passive speculator",
          },
          { id: "self-custody", label: "Self-custody" },
          {
            id: "austrian-economics",
            label: "Austrian economics",
          },
          { id: "btc-only", label: "BTC only philosophy" },
        ],
      },
      {
        id: "web3-infra-dev",
        label: "Infrastructure & Dev",
        termId: "0x24a3480abc66ae94bba8bf4b8952ac6784a7e539ed440ac3901cb3142e9108bf",
        niches: [
          {
            id: "smart-contracts",
            label: "Smart contracts (Solidity)",
          },
          {
            id: "nodes-validators",
            label: "Nodes & validators",
          },
          { id: "zk-proofs", label: "ZK proofs" },
          { id: "protocol-design", label: "Protocol design" },
        ],
      },
      {
        id: "dao-governance",
        label: "DAO & Governance",
        niches: [
          { id: "dao-voting", label: "Voting participation" },
          { id: "contributor-dao", label: "Contributor DAO" },
          { id: "grants-funding", label: "Grants & funding" },
          { id: "token-politics", label: "Token politics" },
        ],
      },
      {
        id: "web3-social",
        label: "Web3 Social",
        niches: [
          { id: "lens-protocol", label: "Lens Protocol" },
          {
            id: "farcaster-warpcast",
            label: "Farcaster / Warpcast",
          },
          { id: "deso", label: "DeSo" },
          { id: "socialfi", label: "SocialFi" },
        ],
      },
      {
        id: "gamefi-metaverse",
        label: "GameFi & Metaverse",
        niches: [
          { id: "play-to-earn", label: "Play-to-earn" },
          { id: "virtual-lands", label: "Virtual lands" },
          {
            id: "interoperable-assets",
            label: "Interoperable assets",
          },
          { id: "vr-ar-web3", label: "VR/AR Web3" },
        ],
      },
      {
        id: "rwa-tokenisation",
        label: "RWA Tokenisation",
        termId: "0xdf1b7a70c58270ea101372e5026a6c483b20c8be7bb80684fd5b6c832c510eeb",
        niches: [
          { id: "rwa-real-estate", label: "Real estate tokenisation" },
          { id: "rwa-commodities", label: "Commodities & bonds" },
          { id: "rwa-compliance", label: "Compliance & regulation" },
        ],
      },
      {
        id: "stablecoins-payments",
        label: "Stablecoins & Payments",
        termId: "0x3192914ddee59330c9b4f453efb940d407578859cb87feb585d4062ac10f89c7",
        niches: [
          { id: "stablecoin-design", label: "Stablecoin design" },
          { id: "cross-border-payments", label: "Cross-border payments" },
          { id: "cbdc", label: "CBDC & digital currencies" },
        ],
      },
      {
        id: "cypherpunk-privacy",
        label: "Cypherpunk & Privacy",
        termId: "0x6bbbb75ab72b3be504b59c7c5728bbf0212368a5456249843cd11ce1e124a019",
        niches: [
          { id: "privacy-protocols", label: "Privacy protocols" },
          { id: "mixers-zk-privacy", label: "Mixers & ZK privacy" },
          { id: "encryption-comms", label: "Encrypted communications" },
        ],
      },
      {
        id: "layer-2s",
        label: "Layer 2s",
        termId: "0x77c6ad9f79a11f242cf7a8d6f4a3e5f8e9c35cab04708198a4c2af1ab71da98a",
        niches: [
          { id: "optimistic-rollups", label: "Optimistic rollups" },
          { id: "zk-rollups", label: "ZK rollups" },
          { id: "l2-bridges", label: "Bridges & interoperability" },
        ],
      },
      {
        id: "security-web3",
        label: "Security",
        termId: "0x44f497066d7ade71154420d3cd075c3a2b02b9f2446301cbf154cdd5f9c5d50f",
        niches: [
          { id: "smart-contract-audits", label: "Smart contract audits" },
          { id: "bug-bounties", label: "Bug bounties" },
          { id: "security-tooling", label: "Security tooling" },
        ],
      },
      {
        id: "applied-cryptography",
        label: "Applied Cryptography",
        termId: "0xa294407354c71d4ad9fd5088726a36a6e3bebc3be70f2b968cec0d601e9a8a7f",
        niches: [
          { id: "mpc", label: "MPC & threshold signatures" },
          { id: "fhe", label: "Fully homomorphic encryption" },
          { id: "post-quantum", label: "Post-quantum cryptography" },
        ],
      },
      {
        id: "zk-tee",
        label: "Zero Knowledge & TEE",
        termId: "0xa1ace10f77b5b560038429d8012862db14a5664bcd53f0b55da75f4cb99ac29d",
        niches: [
          { id: "zk-circuits", label: "ZK circuits & provers" },
          { id: "tee-enclaves", label: "TEE & secure enclaves" },
          { id: "zk-identity", label: "ZK identity & credentials" },
        ],
      },
      {
        id: "ai-agents-web3",
        label: "AI Agents & Automation",
        termId: "0xf3cc343ac2af82d0490e23e39e2e1fc29f279e26aee49bd95914260720e6d671",
        niches: [
          { id: "onchain-ai-agents", label: "On-chain AI agents" },
          { id: "ai-defi-automation", label: "AI-powered DeFi" },
          { id: "decentralized-ai", label: "Decentralized AI networks" },
        ],
      },
      {
        id: "ethstaker",
        label: "EthStaker",
        termId: "0x60792f8e7c11bf88b026587c24ee338f02f883a306d947a0448b998e966f1d93",
        niches: [
          { id: "solo-staking", label: "Solo staking" },
          { id: "liquid-staking", label: "Liquid staking" },
          { id: "dvt", label: "DVT & distributed validators" },
        ],
      },
      {
        id: "web3-research",
        label: "Research",
        termId: "0xe164fa08db1c673380211f9e2afb036b4ecc019b96c3a0d2cb82679aa83723dc",
        niches: [
          { id: "mechanism-design", label: "Mechanism design" },
          { id: "token-economics", label: "Token economics" },
          { id: "consensus-research", label: "Consensus research" },
        ],
      },
      {
        id: "built-on-ethereum",
        label: "Built on Ethereum",
        termId: "0x2dde4c9f1365a17450ca4d651a7c3d3752ccc63ed6e9f4492b8a635c06dbc985",
        niches: [
          { id: "evm-ecosystem", label: "EVM ecosystem" },
          { id: "ethereum-tooling", label: "Ethereum tooling" },
          { id: "eth-standards", label: "EIPs & standards" },
        ],
      },
    ],
  },

  // =========================================================================
  // 6. SCIENCE & KNOWLEDGE
  // =========================================================================
  {
    id: "science",
    label: "Science & Knowledge",
    icon: "microscope",
    color: "#98C379",
    primaryPlatforms: [
      "orcid",
      "arxiv",
      "pubmed",
      "wikipedia",
      "duolingo",
    ],
    categories: [
      {
        id: "mathematics",
        label: "Mathematics & Logic",
        niches: [
          {
            id: "pure-math",
            label: "Pure math (topology, algebra)",
            disambiguationSignal:
              "ORCID publications + research field",
            disambiguationResult:
              "Active scientist vs amateur enthusiast",
          },
          {
            id: "applied-math",
            label: "Applied math & Statistics",
          },
          {
            id: "math-olympiads",
            label: "Olympiades & Puzzles",
          },
          {
            id: "philosophy-of-math",
            label: "Philosophy of mathematics",
          },
        ],
      },
      {
        id: "physics-cosmology",
        label: "Physics & Cosmology",
        niches: [
          {
            id: "theoretical-physics",
            label: "Theoretical physics",
            disambiguationSignal:
              "Duolingo + LeetCode + Kaggle combined",
            disambiguationResult:
              "Languages vs logic vs data science",
          },
          { id: "astrophysics", label: "Astrophysics" },
          { id: "quantum-physics", label: "Quantum physics" },
          {
            id: "pop-science-physics",
            label: "Popular science",
          },
        ],
      },
      {
        id: "biology-neuro",
        label: "Biology & Neuroscience",
        niches: [
          {
            id: "molecular-biology",
            label: "Molecular biology",
            disambiguationSignal:
              "Subreddits: r/math vs r/physics vs r/askscience",
            disambiguationResult: "Exact discipline",
          },
          {
            id: "cognitive-neuro",
            label: "Cognitive neuroscience",
          },
          { id: "genetics-crispr", label: "Genetics & CRISPR" },
          { id: "biohacking", label: "Biohacking" },
        ],
      },
      {
        id: "psychology",
        label: "Psychology & Behavior",
        niches: [
          {
            id: "cognitive-psych",
            label: "Cognitive psychology",
            disambiguationSignal:
              "YouTube: Kurzgesagt vs 3Blue1Brown vs SciShow",
            disambiguationResult:
              "Popular science vs academic depth",
          },
          { id: "social-psych", label: "Social psychology" },
          { id: "therapy-cbt", label: "Therapy & CBT" },
          {
            id: "behavioral-economics",
            label: "Behaviour economics",
          },
        ],
      },
      {
        id: "history-archaeology",
        label: "History & Archaeology",
        niches: [
          { id: "ancient-history", label: "Ancient history" },
          {
            id: "modern-history",
            label: "Modern history",
          },
          {
            id: "archaeology",
            label: "Archaeology & Artifacts",
          },
          { id: "counter-history", label: "Counter-history" },
        ],
      },
      {
        id: "philosophy",
        label: "Philosophy",
        niches: [
          {
            id: "analytic-philosophy",
            label: "Analytic philosophy",
          },
          {
            id: "continental-philosophy",
            label: "Continental philosophy",
          },
          {
            id: "ethics-metaethics",
            label: "Ethics & Meta-ethics",
          },
          {
            id: "philosophy-of-mind",
            label: "Philosophy of mind",
          },
        ],
      },
      {
        id: "linguistics",
        label: "Linguistics & Languages",
        niches: [
          {
            id: "language-learning",
            label: "Language learning",
          },
          {
            id: "structural-linguistics",
            label: "Structural linguistics",
          },
          {
            id: "constructed-languages",
            label: "Constructed languages",
          },
          { id: "etymology", label: "Etymology" },
        ],
      },
    ],
  },

  // =========================================================================
  // 7. SPORT & HEALTH
  // =========================================================================
  {
    id: "sport-health",
    label: "Sport & Health",
    icon: "running",
    color: "#E5C07B",
    primaryPlatforms: [
      "strava",
      "garmin",
      "komoot",
      "inaturalist",
      "ebird",
    ],
    categories: [
      {
        id: "team-sports",
        label: "Team Sports",
        niches: [
          {
            id: "football-player",
            label: "Football (player vs supporter)",
            disambiguationSignal:
              "Strava dominant activity (run vs bike vs swim)",
            disambiguationResult: "Precise practiced sport",
          },
          { id: "basketball", label: "Basketball" },
          { id: "rugby", label: "Rugby" },
          {
            id: "us-sports",
            label: "Sports US (NFL, NBA)",
          },
        ],
      },
      {
        id: "individual-sports",
        label: "Individual Sports",
        niches: [
          {
            id: "tennis-padel",
            label: "Tennis & Padel",
            disambiguationSignal:
              "Garmin VO2max + HRV trends",
            disambiguationResult:
              "Amateur vs semi-pro vs casual health",
          },
          { id: "swimming", label: "Swimming" },
          {
            id: "cycling-triathlon",
            label: "Cycling & Triathlon",
          },
          { id: "athletics", label: "Athletics" },
        ],
      },
      {
        id: "fitness",
        label: "Fitness & Strength Training",
        niches: [
          {
            id: "powerlifting",
            label: "Powerlifting & Strength",
            disambiguationSignal:
              "Subreddits r/running vs r/powerlifting vs r/MMA",
            disambiguationResult: "Exact discipline",
          },
          {
            id: "bodybuilding",
            label: "Bodybuilding & Aesthetics",
          },
          {
            id: "crossfit",
            label: "CrossFit & Functional",
          },
          { id: "calisthenics", label: "Calisthenics" },
        ],
      },
      {
        id: "extreme-sports",
        label: "Extreme Sports",
        niches: [
          {
            id: "climbing-boulder",
            label: "Climbing & Bouldering",
            disambiguationSignal:
              "Twitch sport streams vs ESPN = player vs supporter",
            disambiguationResult: "Practitioner vs spectator",
          },
          { id: "surf-kite", label: "Surf & Kite" },
          {
            id: "snowboard-freeride",
            label: "Snowboard freeride",
          },
          { id: "parkour", label: "Parkour & Freerun" },
        ],
      },
      {
        id: "running-trail",
        label: "Running & Trail",
        niches: [
          { id: "urban-running", label: "Urban running" },
          {
            id: "short-trail",
            label: "Short-distance trail",
          },
          { id: "ultra-trail", label: "Ultra-trail" },
          {
            id: "running-data",
            label: "Running data & perf",
          },
        ],
      },
      {
        id: "combat-sports",
        label: "Combat Sports",
        niches: [
          { id: "mma-grappling", label: "MMA & Grappling" },
          {
            id: "boxing-muay-thai",
            label: "Boxing & Muay Thai",
          },
          { id: "judo-bjj", label: "Judo & Jiu-Jitsu" },
          {
            id: "martial-arts",
            label: "Martial arts",
          },
        ],
      },
      {
        id: "health-wellness",
        label: "Health & Wellness",
        niches: [
          {
            id: "nutrition",
            label: "Nutrition & Dietetics",
          },
          { id: "yoga-pilates", label: "Yoga & Pilates" },
          {
            id: "meditation-mindfulness",
            label: "Meditation & Mindfulness",
          },
          {
            id: "biohacking-longevity",
            label: "Biohacking & Longevity",
          },
        ],
      },
    ],
  },

  // =========================================================================
  // 8. VIDEO & CINEMA
  // =========================================================================
  {
    id: "video-cinema",
    label: "Video & Cinema",
    icon: "film",
    color: "#E06C75",
    primaryPlatforms: [
      "twitch",
      "youtube",
      "vimeo",
      "trakt",
      "dailymotion",
    ],
    categories: [
      {
        id: "cinephilia",
        label: "Cinephilia",
        niches: [
          {
            id: "arthouse",
            label: "Auteur cinema & Arthouse",
            disambiguationSignal:
              "Letterboxd dominant genres + rating frequency",
            disambiguationResult:
              "Cinephile vs casual viewer",
          },
          { id: "scifi-fantasy-film", label: "Sci-fi & Fantasy" },
          {
            id: "horror-thriller",
            label: "Horror & Thriller",
          },
          { id: "documentary-film", label: "Documentary" },
        ],
      },
      {
        id: "filmmaking",
        label: "Filmmaking & Editing",
        niches: [
          {
            id: "indie-cinema",
            label: "Independent cinema",
            disambiguationSignal:
              "YouTube subscribed channels: dominant content genre",
            disambiguationResult:
              "Creation vs consumption",
          },
          { id: "short-film", label: "Short film" },
          {
            id: "premiere-davinci",
            label: "Premiere / DaVinci Resolve",
          },
          { id: "color-grading", label: "Color grading" },
        ],
      },
      {
        id: "streaming-series",
        label: "Streaming & TV Series",
        niches: [
          {
            id: "prestige-tv",
            label: "Drama & Prestige TV",
            disambiguationSignal:
              "Vimeo portfolio vs YouTube upload",
            disambiguationResult: "Pro video vs amateur",
          },
          { id: "anime", label: "Anime" },
          {
            id: "reality-entertainment",
            label: "Reality TV & Entertainment",
          },
          { id: "true-crime", label: "True crime" },
        ],
      },
      {
        id: "youtube-content",
        label: "YouTube & Content",
        niches: [
          {
            id: "vlogging",
            label: "Vlogging & Lifestyle",
            disambiguationSignal:
              "Twitch hours vs uploaded content",
            disambiguationResult:
              "Creator vs passive viewer",
          },
          {
            id: "edu-vulgarisation",
            label: "Educational / Popular science",
          },
          {
            id: "lets-play",
            label: "Let's Play & Gaming",
          },
          { id: "tech-reviews", label: "Tech reviews" },
        ],
      },
      {
        id: "animation",
        label: "Animation",
        niches: [
          { id: "2d-animation", label: "2D frame by frame" },
          {
            id: "3d-animation",
            label: "3D animation (Blender)",
          },
          {
            id: "motion-graphics",
            label: "Motion graphics",
          },
          { id: "stop-motion", label: "Stop motion" },
        ],
      },
      {
        id: "film-criticism",
        label: "Criticism & Analysis",
        niches: [
          { id: "film-critic", label: "Film criticism" },
          { id: "video-essays", label: "Video essays" },
          { id: "cinema-podcasts", label: "Cinema podcasts" },
          {
            id: "cultural-journalism",
            label: "Cultural journalism",
          },
        ],
      },
    ],
  },

  // =========================================================================
  // 9. ENTREPRENEURSHIP & BUSINESS
  // =========================================================================
  {
    id: "entrepreneurship",
    label: "Entrepreneurship & Business",
    icon: "rocket",
    color: "#D19A66",
    primaryPlatforms: [
      "producthunt",
      "linear",
      "github",
      "hacker-news",
    ],
    categories: [
      {
        id: "startup-saas",
        label: "Startup & SaaS",
        niches: [
          {
            id: "indie-hacking",
            label: "Indie hacking & bootstrapping",
            disambiguationSignal:
              "Product Hunt launches + received upvotes",
            disambiguationResult:
              "Active builder vs observer",
          },
          { id: "vc-startup", label: "VC-backed startup" },
          { id: "saas-b2b", label: "SaaS B2B" },
          { id: "consumer-apps", label: "Consumer apps" },
        ],
      },
      {
        id: "freelance-consulting",
        label: "Freelance & Consulting",
        niches: [
          {
            id: "dev-freelance",
            label: "Dev freelance",
            disambiguationSignal:
              "GitHub repos with landing pages = indie hacker",
            disambiguationResult:
              "Concrete maker vs business theorist",
          },
          {
            id: "design-freelance",
            label: "Design freelance",
          },
          {
            id: "strategy-consulting",
            label: "Strategy consulting",
          },
          { id: "portage", label: "Umbrella company" },
        ],
      },
      {
        id: "ecommerce",
        label: "E-commerce",
        niches: [
          {
            id: "dropshipping",
            label: "Dropshipping",
            disambiguationSignal:
              "LinkedIn role Founder vs Employee vs Freelance",
            disambiguationResult:
              "Exact entrepreneurial status",
          },
          { id: "d2c-brand", label: "Own brand & D2C" },
          { id: "amazon-fba", label: "Amazon FBA" },
          {
            id: "marketplace-etsy",
            label: "Marketplace & Etsy",
          },
        ],
      },
      {
        id: "marketing-growth",
        label: "Marketing & Growth",
        niches: [
          {
            id: "seo-content",
            label: "SEO & Content marketing",
            disambiguationSignal:
              "r/entrepreneur vs r/wallstreetbets vs r/fire",
            disambiguationResult:
              "Type of financial ambition",
          },
          {
            id: "paid-ads",
            label: "Paid ads (Meta, Google)",
          },
          { id: "growth-hacking", label: "Growth hacking" },
          {
            id: "community-building",
            label: "Community building",
          },
        ],
      },
      {
        id: "finance-investing",
        label: "Finance & Investing",
        niches: [
          { id: "stock-etf", label: "Stock market & ETF" },
          { id: "angel-investing", label: "Angel investing" },
          { id: "vc-dealflow", label: "VC & Deal flow" },
          {
            id: "real-estate-investing",
            label: "Real estate",
          },
        ],
      },
      {
        id: "personal-branding",
        label: "Personal branding",
        niches: [
          { id: "newsletter", label: "Newsletter" },
          {
            id: "linkedin-thought-leader",
            label: "LinkedIn thought leader",
          },
          { id: "podcast-host", label: "Podcast" },
          {
            id: "speaking-keynotes",
            label: "Speaking & keynotes",
          },
        ],
      },
      {
        id: "productivity-systems",
        label: "Productivity & Systems",
        niches: [
          { id: "gtd-agile", label: "GTD & Agile Methods" },
          {
            id: "second-brain",
            label: "Second brain (Notion, Obsidian)",
          },
          { id: "time-blocking", label: "Time blocking" },
          { id: "deep-work", label: "Deep work" },
        ],
      },
    ],
  },

  // =========================================================================
  // 10. PERFORMING ARTS
  // =========================================================================
  {
    id: "performing-arts",
    label: "Performing Arts",
    icon: "theater",
    color: "#E06C75",
    primaryPlatforms: ["twitch", "youtube", "discord"],
    categories: [
      {
        id: "theater",
        label: "Theater",
        niches: [
          {
            id: "classical-theater",
            label: "Classical & Contemporary theater",
            disambiguationSignal:
              "Twitch categorie 'Performing Arts'",
            disambiguationResult:
              "Live artist vs spectator",
          },
          { id: "improv", label: "Improvisation" },
          { id: "physical-theater", label: "Physical theater" },
          { id: "mise-en-scene", label: "Directing" },
        ],
      },
      {
        id: "dance",
        label: "Dance",
        niches: [
          {
            id: "classical-dance",
            label: "Classical & Contemporary dance",
            disambiguationSignal:
              "YouTube subscriptions: dance channels vs culture",
            disambiguationResult:
              "Practitioner vs cultural amateur",
          },
          {
            id: "hiphop-breakdance",
            label: "Hip-hop & Breakdance",
          },
          {
            id: "latin-dance",
            label: "Latin dances (salsa, tango)",
          },
          {
            id: "traditional-dance",
            label: "Traditional dance",
          },
        ],
      },
      {
        id: "circus-performance",
        label: "Circus & Performance",
        niches: [
          {
            id: "circus-acrobatics",
            label: "Circus arts (acrobatics)",
            disambiguationSignal:
              "Discord: improv / theater / collective servers",
            disambiguationResult: "Specific community",
          },
          { id: "performance-art", label: "Performance art" },
          {
            id: "street-art-graffiti",
            label: "Street art & Graffiti",
          },
          { id: "installation-art", label: "Installation" },
        ],
      },
      {
        id: "comedy",
        label: "Comedy & Stand-up",
        niches: [
          {
            id: "standup",
            label: "Stand-up comedy",
            disambiguationSignal:
              "Frequent ticketing (if partnership)",
            disambiguationResult:
              "Regular spectator vs artist",
          },
          {
            id: "sketch-improv-comedy",
            label: "Sketch & Comedy improv",
          },
          {
            id: "comedy-podcasts",
            label: "Comedy podcasts",
          },
          {
            id: "comedy-writing",
            label: "Comedy writing",
          },
        ],
      },
      {
        id: "magic",
        label: "Magic & Conjuring",
        niches: [
          { id: "close-up-magic", label: "Close-up magic" },
          { id: "stage-illusion", label: "Stage & Illusion" },
          { id: "mentalism", label: "Mentalism" },
          {
            id: "card-manipulation",
            label: "Card manipulation",
          },
        ],
      },
    ],
  },

  // =========================================================================
  // 11. NATURE & ENVIRONMENT
  // =========================================================================
  {
    id: "nature-environment",
    label: "Nature & Environment",
    icon: "leaf",
    color: "#98C379",
    primaryPlatforms: [
      "inaturalist",
      "ebird",
      "komoot",
      "alltrails",
      "wikiloc",
    ],
    categories: [
      {
        id: "ecology-activism",
        label: "Ecology & Activism",
        niches: [
          {
            id: "climate-activism",
            label: "Climate activism",
            disambiguationSignal:
              "Strava outdoor segments vs gym",
            disambiguationResult:
              "Nature practitioner vs urban",
          },
          {
            id: "zero-waste",
            label: "Zero waste & Minimalism",
          },
          { id: "permaculture", label: "Permaculture" },
          {
            id: "environmental-politics",
            label: "Environmental politics",
          },
        ],
      },
      {
        id: "outdoor-adventure",
        label: "Outdoors & Adventure",
        niches: [
          {
            id: "hiking-trek",
            label: "Hiking & Trekking",
            disambiguationSignal:
              "iNaturalist / eBird active activity",
            disambiguationResult:
              "Scientific observer vs leisure hiker",
          },
          {
            id: "camping-survival",
            label: "Camping & Survivalism",
          },
          {
            id: "outdoor-climbing",
            label: "Outdoor climbing",
          },
          { id: "kayak-canoe", label: "Kayak & Canoe" },
        ],
      },
      {
        id: "astronomy",
        label: "Astronomy",
        niches: [
          {
            id: "amateur-astronomy",
            label: "Amateur observation (telescope)",
            disambiguationSignal:
              "r/gardening vs r/preppers vs r/environment",
            disambiguationResult:
              "Exact nature orientation",
          },
          {
            id: "astrophotography",
            label: "Astrophotography",
          },
          {
            id: "cosmology-vulg",
            label: "Cosmology & Popular science",
          },
          {
            id: "space-exploration",
            label: "Space exploration",
          },
        ],
      },
      {
        id: "gardening",
        label: "Gardening & Agriculture",
        niches: [
          { id: "vegetable-garden", label: "Vegetable gardening" },
          {
            id: "indoor-plants",
            label: "Indoor plants",
          },
          { id: "urban-farming", label: "Urban farming" },
          {
            id: "medicinal-garden",
            label: "Medicinal gardening",
          },
        ],
      },
      {
        id: "zoology-fauna",
        label: "Zoology & Wildlife",
        niches: [
          {
            id: "birdwatching",
            label: "Ornithology & Bird watching",
          },
          { id: "aquarium", label: "Aquarium keeping" },
          { id: "animal-breeding", label: "Breeding & Animals" },
          {
            id: "wildlife-protection",
            label: "Wildlife protection",
          },
        ],
      },
    ],
  },

  // =========================================================================
  // 12. FOOD, FASHION & LIFESTYLE
  // =========================================================================
  {
    id: "food-lifestyle",
    label: "Food, Fashion & Lifestyle",
    icon: "utensils",
    color: "#E5C07B",
    primaryPlatforms: [
      "untappd",
      "vivino",
      "discogs",
      "pinterest",
    ],
    categories: [
      {
        id: "gastronomy",
        label: "Gastronomy & Cooking",
        niches: [
          {
            id: "world-cuisine",
            label: "World cuisine",
            disambiguationSignal:
              "r/coffee vs r/tea vs r/cocktails = dominant beverage",
            disambiguationResult:
              "Exact beverage niche",
          },
          {
            id: "pastry-baking",
            label: "Pastry & Baking",
          },
          { id: "bbq-smoking", label: "BBQ & Smoking" },
          {
            id: "molecular-cuisine",
            label: "Molecular cuisine",
          },
        ],
      },
      {
        id: "beverages",
        label: "Coffee & Beverages",
        niches: [
          {
            id: "specialty-coffee",
            label: "Specialty coffee (barista)",
            disambiguationSignal:
              "StockX / GOAT activite = sneaker culture active",
            disambiguationResult:
              "Collector vs reseller vs casual",
          },
          { id: "tea-ceremony", label: "Tea & Ceremony" },
          {
            id: "mixology-cocktails",
            label: "Mixology & Cocktails",
          },
          { id: "craft-beer", label: "Craft beer" },
        ],
      },
      {
        id: "fashion-streetwear",
        label: "Mode & Streetwear",
        niches: [
          {
            id: "high-fashion",
            label: "High fashion & Luxe",
            disambiguationSignal:
              "Etsy seller vs buyer",
            disambiguationResult:
              "Active maker vs lifestyle consumer",
          },
          {
            id: "streetwear-hype",
            label: "Streetwear & Hype (Jordan, Supreme)",
          },
          { id: "vintage-thrift", label: "Vintage & Thrift" },
          { id: "ethical-fashion", label: "Ethical fashion" },
        ],
      },
      {
        id: "collectibles",
        label: "Collectibles & Sneakers",
        niches: [
          {
            id: "sneaker-collecting",
            label: "Sneaker collecting",
          },
          {
            id: "trading-cards",
            label: "Trading cards & Pokemon",
          },
          {
            id: "figurines-pop",
            label: "Figurines & Pop culture",
          },
          { id: "watches", label: "Watches" },
        ],
      },
      {
        id: "diy-making",
        label: "DIY & Making",
        niches: [
          { id: "woodworking", label: "Woodworking" },
          { id: "3d-printing-hobby", label: "3D Printing" },
          {
            id: "electronics-hobby",
            label: "Electronics hobby",
          },
          {
            id: "sewing-knitting",
            label: "Sewing & Knitting",
          },
        ],
      },
      {
        id: "home-decor",
        label: "Decor & Interior",
        niches: [
          { id: "interior-design", label: "Interior design" },
          {
            id: "minimalism-fengshui",
            label: "Minimalisme & Feng shui",
          },
          {
            id: "interior-architecture",
            label: "Interior architecture",
          },
          {
            id: "biophilic-plants",
            label: "Plantes & Biophilic",
          },
        ],
      },
    ],
  },

  // =========================================================================
  // 13. LITERATURE & WRITING
  // =========================================================================
  {
    id: "literature",
    label: "Literature & Writing",
    icon: "book",
    color: "#ABB2BF",
    primaryPlatforms: [
      "openlibrary",
      "librarything",
      "pocket",
      "feedly",
    ],
    categories: [
      {
        id: "fiction",
        label: "Fiction",
        niches: [
          {
            id: "scifi-dystopia",
            label: "Science fiction & Dystopia",
            disambiguationSignal:
              "Goodreads dominant genres + reading speed",
            disambiguationResult:
              "Casual reader vs avid reader vs critic",
          },
          {
            id: "fantasy-epic",
            label: "Fantasy & Epic fantasy",
          },
          {
            id: "thriller-detective",
            label: "Thriller & Detective",
          },
          { id: "manga-comics", label: "Manga & Comics" },
        ],
      },
      {
        id: "nonfiction",
        label: "Non-fiction & Essays",
        niches: [
          {
            id: "political-essays",
            label: "Political essays & Philosophy",
            disambiguationSignal:
              "Own Substack newsletter + active subscriptions",
            disambiguationResult:
              "Writer vs passionate reader",
          },
          {
            id: "biographies",
            label: "Biographies & Memoirs",
          },
          {
            id: "business-selfhelp",
            label: "Business & Self-help",
          },
          {
            id: "pop-science-books",
            label: "Popular science",
          },
        ],
      },
      {
        id: "creative-writing",
        label: "Creative Writing",
        niches: [
          {
            id: "novel-short-story",
            label: "Novel & Short story",
            disambiguationSignal:
              "r/scifi vs r/fantasy vs r/books",
            disambiguationResult:
              "Precise literary niche",
          },
          { id: "screenplay", label: "Screenplay & Script" },
          { id: "poetry", label: "Poetry" },
          { id: "worldbuilding", label: "World-building" },
        ],
      },
      {
        id: "journalism",
        label: "Journalism",
        niches: [
          {
            id: "investigative",
            label: "Investigative journalism",
          },
          { id: "field-reporting", label: "Field reporting" },
          { id: "data-journalism", label: "Data journalism" },
          {
            id: "documentary-podcast",
            label: "Documentary podcast",
          },
        ],
      },
      {
        id: "blogging-content",
        label: "Blogging & Content",
        niches: [
          {
            id: "substack-newsletter",
            label: "Newsletter (Substack)",
          },
          { id: "thematic-blog", label: "Thematic blog" },
          { id: "ghostwriting", label: "Ghostwriting" },
          { id: "copywriting", label: "Copywriting" },
        ],
      },
      {
        id: "literary-criticism",
        label: "Literary Criticism",
        niches: [
          { id: "book-reviews", label: "Book clubs & Reviews" },
          { id: "translation", label: "Translation" },
          {
            id: "editing-curation",
            label: "Editing & Curation",
          },
          {
            id: "comparative-lit",
            label: "Comparative literature",
          },
        ],
      },
    ],
  },

  // =========================================================================
  // 14. PERSONAL DEVELOPMENT
  // =========================================================================
  {
    id: "personal-dev",
    label: "Personal Development",
    icon: "lotus",
    color: "#C678DD",
    primaryPlatforms: ["duolingo", "todoist", "reddit"],
    categories: [
      {
        id: "mindfulness-spirituality",
        label: "Mindfulness & Spirituality",
        niches: [
          {
            id: "meditation-vipassana",
            label: "Meditation (Vipassana, Zen)",
            disambiguationSignal:
              "Headspace / Calm active subscription",
            disambiguationResult:
              "Regular practitioner vs occasional curious",
          },
          {
            id: "new-age-spirituality",
            label: "New-age spirituality",
          },
          {
            id: "stoicism",
            label: "Stoicism & Practical philosophy",
          },
          { id: "shamanism", label: "Shamanism" },
        ],
      },
      {
        id: "coaching-leadership",
        label: "Coaching & Leadership",
        niches: [
          {
            id: "executive-coaching",
            label: "Executive coaching",
            disambiguationSignal:
              "Duolingo streak + GTD tools + Notion combined",
            disambiguationResult:
              "Obsessed optimizer vs balanced",
          },
          { id: "life-coaching", label: "Life coaching" },
          {
            id: "leadership-management",
            label: "Leadership & Management",
          },
          { id: "nvc", label: "Non-violent communication" },
        ],
      },
      {
        id: "relationships",
        label: "Relations & Social",
        niches: [
          {
            id: "dating-relationships",
            label: "Romantic relationships & Dating",
            disambiguationSignal:
              "r/financepersonnelle vs r/fire vs r/selfimprovement",
            disambiguationResult:
              "Dominant axis in personal dev",
          },
          {
            id: "interpersonal-comm",
            label: "Interpersonal communication",
          },
          {
            id: "conscious-parenting",
            label: "Conscious parenting",
          },
          {
            id: "community-building-perso",
            label: "Community",
          },
        ],
      },
      {
        id: "personal-finance",
        label: "Personal Finance",
        niches: [
          { id: "fire", label: "FIRE (Financial Independence)" },
          {
            id: "passive-investing",
            label: "Passive investing (ETF)",
          },
          { id: "budgeting", label: "Budgeting & Frugality" },
          {
            id: "rental-real-estate",
            label: "Rental real estate",
          },
        ],
      },
      {
        id: "neurodiversity",
        label: "Neurodiversity & Mental Health",
        niches: [
          { id: "adhd-autism", label: "ADHD & Autism" },
          {
            id: "anxiety-depression",
            label: "Anxiety & Depression",
          },
          { id: "therapy-cbt-emdr", label: "Therapies (CBT, EMDR)" },
          {
            id: "psychedelics-therapy",
            label: "Psychedelics & Therapy",
          },
        ],
      },
    ],
  },
]

// =============================================================================
// DERIVED HELPERS
// =============================================================================

export const DOMAIN_BY_ID = new Map(
  SOFIA_DOMAINS.map((d) => [d.id, d])
)

export const ALL_CATEGORIES = SOFIA_DOMAINS.flatMap((d) =>
  d.categories.map((c) => ({ ...c, domainId: d.id }))
)

export const ALL_NICHES = SOFIA_DOMAINS.flatMap((d) =>
  d.categories.flatMap((c) =>
    c.niches.map((n) => ({
      ...n,
      categoryId: c.id,
      domainId: d.id,
    }))
  )
)

export const NICHE_BY_ID = new Map(
  ALL_NICHES.map((n) => [n.id, n])
)

export const CATEGORY_BY_ID = new Map(
  ALL_CATEGORIES.map((c) => [c.id, c])
)

export function getNichesForDomain(
  domainId: string
): typeof ALL_NICHES {
  return ALL_NICHES.filter((n) => n.domainId === domainId)
}

export function getCategoriesForDomain(
  domainId: string
): typeof ALL_CATEGORIES {
  return ALL_CATEGORIES.filter((c) => c.domainId === domainId)
}

export function getDomainForNiche(
  nicheId: string
): Domain | undefined {
  const niche = NICHE_BY_ID.get(nicheId)
  return niche ? DOMAIN_BY_ID.get(niche.domainId) : undefined
}

export function getSuggestedPlatforms(
  categoryIds: string[]
): string[] {
  const domainIds = new Set(
    categoryIds
      .map((id) => CATEGORY_BY_ID.get(id)?.domainId)
      .filter(Boolean)
  )
  return SOFIA_DOMAINS.filter((d) => domainIds.has(d.id))
    .flatMap((d) => d.primaryPlatforms)
    .filter((v, i, a) => a.indexOf(v) === i)
}
