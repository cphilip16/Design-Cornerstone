import { useEffect, useMemo, useState } from 'react'
import {
  ArrowUpRight,
  Award,
  BookOpen,
  Check,
  ChevronRight,
  Compass,
  Footprints,
  Landmark,
  MapPin,
  Menu,
  Search,
  Sparkles,
  Star,
  Ticket,
  Trophy,
  Utensils,
  X,
} from 'lucide-react'

type Category = 'Landmarks' | 'Food & drink' | 'Study spots' | 'Green spaces'
type Destination = {
  id: string
  name: string
  category: Category
  points: number
  distance: string
  description: string
  tag: string
  tone: string
}

type Rank = { name: string; min: number; max: number; note: string }

const destinations: Destination[] = [
  { id: 'decker-quad', name: 'Decker Quad', category: 'Landmarks', points: 40, distance: '4 min walk', description: 'The original heart of Homewood, framed by the George Peabody statue.', tag: 'Classic', tone: 'blue' },
  { id: 'blue-jay', name: 'The Blue Jay Sculpture', category: 'Landmarks', points: 35, distance: '7 min walk', description: 'Meet the campus mascot and get the perfect first Flock photo.', tag: 'Must see', tone: 'coral' },
  { id: 'evergreen', name: 'Evergreen Cafe', category: 'Food & drink', points: 50, distance: '6 min walk', description: 'A cozy stop for coffee, tea, and a little off-campus energy.', tag: 'Recharge', tone: 'gold' },
  { id: 'sugarvale', name: 'Sugarvale', category: 'Food & drink', points: 50, distance: '12 min walk', description: 'Natural wine and small plates for your next Charles Village evening.', tag: 'After hours', tone: 'pink' },
  { id: 'milton', name: 'Milton S. Eisenhower Library', category: 'Study spots', points: 35, distance: '3 min walk', description: 'Find a new corner of the library, from the stacks to the quiet floor.', tag: 'Focus', tone: 'green' },
  { id: 'mudd', name: 'Mudd Hall Garden', category: 'Green spaces', points: 35, distance: '8 min walk', description: 'A tucked-away garden made for a reset between classes.', tag: 'Breathe', tone: 'green' },
  { id: 'wyman', name: 'Wyman Park Dell', category: 'Green spaces', points: 55, distance: '18 min walk', description: 'Follow the path north for a pocket of wild Baltimore.', tag: 'Big detour', tone: 'blue' },
  { id: 'patterson-park', name: 'Patterson Park', category: 'Green spaces', points: 70, distance: '30 min by transit', description: 'Climb the Pagoda, find the lake, and spend an afternoon in Baltimore\'s favorite park.', tag: 'Big detour', tone: 'green' },
  { id: 'bma', name: 'Baltimore Museum of Art', category: 'Landmarks', points: 60, distance: '15 min walk', description: 'A world-class collection, right across the street from campus.', tag: 'Worth it', tone: 'coral' },
  { id: 'thirty-second-market', name: "32nd Street Farmer's Market", category: 'Food & drink', points: 50, distance: '14 min walk', description: 'Browse local produce, prepared food, and neighborhood favorites in Waverly.', tag: 'Saturday stop', tone: 'gold' },
  { id: 'levering-market', name: 'Levering Market', category: 'Food & drink', points: 50, distance: '10 min walk', description: 'A Charles Village market for a quick bite, a cold drink, or a pantry restock.', tag: 'Local pick', tone: 'green' },
  { id: 'peabody-library', name: 'George Peabody Library', category: 'Study spots', points: 60, distance: '24 min walk', description: 'Step into one of Baltimore\'s most beautiful reading rooms in Mount Vernon.', tag: 'Quiet hour', tone: 'blue' },
  { id: 'medical-campus', name: 'Johns Hopkins Medical Campus', category: 'Landmarks', points: 65, distance: '35 min walk', description: 'Explore the historic East Baltimore campus and the original Johns Hopkins hospital.', tag: 'JHU history', tone: 'coral' },
  { id: 'baltimore-aquarium', name: 'National Aquarium', category: 'Landmarks', points: 75, distance: '34 min by transit', description: 'Meet the animals and ecosystems of the blue planet at the Inner Harbor.', tag: 'Big adventure', tone: 'blue' },
  { id: 'hard-rock', name: 'Hard Rock Cafe Baltimore', category: 'Food & drink', points: 50, distance: '33 min by transit', description: 'Grab a meal at the Inner Harbor and take in the music memorabilia.', tag: 'City sound', tone: 'pink' },
  { id: 'fells-point', name: 'Fells Point', category: 'Landmarks', points: 65, distance: '35 min by transit', description: 'Wander the cobblestone waterfront streets and independent shops of historic Fells Point.', tag: 'Waterfront', tone: 'coral' },
  { id: 'inner-harbor', name: 'Inner Harbor', category: 'Landmarks', points: 60, distance: '32 min by transit', description: 'Take in Baltimore\'s iconic waterfront promenade, boats, and city views.', tag: 'City view', tone: 'blue' },
  { id: 'baltimore-zoo', name: 'Baltimore Zoo', category: 'Landmarks', points: 70, distance: '25 min by transit', description: 'Spend an afternoon meeting animals and exploring the historic Druid Hill Park grounds.', tag: 'Wild card', tone: 'green' },
  { id: 'ekiben', name: 'Ekiben', category: 'Food & drink', points: 50, distance: '13 min walk', description: 'Try the iconic steamed bun and bold Asian-inspired flavors in Fells Point.', tag: 'Local favorite', tone: 'gold' },
  { id: 'charmery', name: 'The Charmery', category: 'Food & drink', points: 50, distance: '12 min walk', description: 'Cool down with imaginative, Baltimore-inspired ice cream flavors.', tag: 'Sweet stop', tone: 'pink' },
]

const ranks: Rank[] = [
  { name: 'Newbie', min: 0, max: 149, note: 'Your first steps around campus' },
  { name: 'Roamer', min: 150, max: 349, note: 'You know the good shortcuts' },
  { name: 'Pro', min: 350, max: 649, note: 'A true campus local' },
  { name: 'Legend', min: 650, max: 9999, note: 'Leave no corner unexplored' },
]

const STORAGE_KEY = 'flock-demo-profile'
const getStoredVisited = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as string[]
  } catch {
    return []
  }
}

function getRank(points: number) {
  return ranks.find((rank) => points >= rank.min && points <= rank.max) ?? ranks[0]
}

function App() {
  const [visitedIds, setVisitedIds] = useState<string[]>(getStoredVisited)
  const [activeCategory, setActiveCategory] = useState<'All' | Category>('All')
  const [search, setSearch] = useState('')
  const [showMobileNav, setShowMobileNav] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visitedIds))
  }, [visitedIds])

  const points = visitedIds.reduce((total, id) => total + (destinations.find((place) => place.id === id)?.points ?? 0), 0)
  const rank = getRank(points)
  const nextRank = ranks[ranks.indexOf(rank) + 1]
  const progress = nextRank ? Math.min(((points - rank.min) / (nextRank.min - rank.min)) * 100, 100) : 100
  const visitedCount = visitedIds.length
  const filteredDestinations = useMemo(() => destinations.filter((place) => {
    const matchesCategory = activeCategory === 'All' || place.category === activeCategory
    const query = search.toLowerCase()
    return matchesCategory && (!query || `${place.name} ${place.category} ${place.description}`.toLowerCase().includes(query))
  }), [activeCategory, search])

  const markVisited = (place: Destination) => {
    if (visitedIds.includes(place.id)) return
    setVisitedIds((current) => [...current, place.id])
    setToast(`${place.name} added +${place.points} pts`)
    window.setTimeout(() => setToast(''), 2800)
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${showMobileNav ? 'sidebar-open' : ''}`}>
        <div className="brand"><span className="brand-mark">F</span><span>Flock</span></div>
        <button className="close-nav" onClick={() => setShowMobileNav(false)} aria-label="Close navigation"><X size={20} /></button>
        <div className="sidebar-profile">
          <div className="avatar">JM</div>
          <div><strong>Jordan Miller</strong><span>Homewood '26</span></div>
        </div>
        <nav className="nav-links" aria-label="Main navigation">
          <a className="active" href="#explore"><Compass size={18} /> Explore <span className="nav-dot" /></a>
          <a href="#journey"><Footprints size={18} /> My journey</a>
          <a href="#rewards"><Trophy size={18} /> Rewards</a>
        </nav>
        <div className="sidebar-bottom">
          <div className="mini-note"><Sparkles size={16} /><span>Every place has a story.<br /><b>Go find yours.</b></span></div>
          <span className="version">Flock / beta 01</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setShowMobileNav(true)} aria-label="Open navigation"><Menu size={20} /></button>
          <div className="breadcrumbs"><span>Homewood campus</span><ChevronRight size={14} /><b>Explore</b></div>
          <button className="profile-button"><span className="status-dot" /> Syncing locally <ChevronRight size={16} /></button>
        </header>

        <section className="hero" id="explore">
          <div className="hero-copy">
            <p className="eyebrow"><span /> Your campus, collected</p>
            <h1>Go a little<br /><em>further.</em></h1>
            <p className="hero-description">Turn your time at Hopkins into a collection of good stories, one destination at a time.</p>
          </div>
          <div className="hero-stamp"><span>EST.</span><strong>JHU</strong><span>HOMEWOOD</span></div>
          <div className="hero-lines" aria-hidden="true"><span /><span /><span /></div>
        </section>

        <section className="progress-strip" id="journey">
          <div className="rank-overview"><div className="rank-icon"><Award size={24} /></div><div><span className="label">Current title</span><strong>{rank.name}</strong></div></div>
          <div className="rank-progress"><div className="progress-label"><span>{points} pts collected</span><span>{nextRank ? `${nextRank.min - points} pts to ${nextRank.name}` : 'Top rank reached'}</span></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div></div>
          <div className="stats"><div><strong>{visitedCount}</strong><span>places visited</span></div><div><strong>{destinations.length - visitedCount}</strong><span>still to find</span></div></div>
        </section>

        <div className="content-grid">
          <section className="destination-section">
            <div className="section-heading"><div><p className="eyebrow">The shortlist</p><h2>Places to go</h2></div><span className="count-badge">{filteredDestinations.length} spots</span></div>
            <div className="toolbar"><div className="search-box"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search places..." /></div><div className="filters" role="group" aria-label="Filter destinations"><button className={activeCategory === 'All' ? 'selected' : ''} onClick={() => setActiveCategory('All')}>All</button><button className={activeCategory === 'Landmarks' ? 'selected' : ''} onClick={() => setActiveCategory('Landmarks')}><Landmark size={14} />Landmarks</button><button className={activeCategory === 'Food & drink' ? 'selected' : ''} onClick={() => setActiveCategory('Food & drink')}><Utensils size={14} />Food</button><button className={activeCategory === 'Study spots' ? 'selected' : ''} onClick={() => setActiveCategory('Study spots')}><BookOpen size={14} />Study</button></div></div>
            <div className="destination-list">{filteredDestinations.map((place, index) => { const visited = visitedIds.includes(place.id); return <article className={`destination-card ${visited ? 'visited' : ''}`} key={place.id} style={{ '--delay': `${index * 45}ms` } as React.CSSProperties}><div className={`card-illustration ${place.tone}`}><span className="card-tag">{place.tag}</span><MapPin size={20} /><span className="illustration-label">{place.name.split(' ').map((word) => word[0]).join('').slice(0, 3)}</span></div><div className="card-body"><div className="card-meta"><span>{place.category}</span><span className="distance">{place.distance}</span></div><h3>{place.name}</h3><p>{place.description}</p><div className="card-footer"><strong>+{place.points} <small>points</small></strong><button className={visited ? 'visited-button' : ''} onClick={() => markVisited(place)} disabled={visited}>{visited ? <><Check size={15} /> Visited</> : <>Mark visited <ArrowUpRight size={15} /></>}</button></div></div></article> })}</div>
          </section>

          <aside className="right-rail" id="rewards">
            <div className="rail-heading"><p className="eyebrow">Your collection</p><h2>Keep exploring.</h2></div>
            <div className="next-rank-card"><div className="next-rank-top"><span>Next title</span><span className="sparkle-icon"><Sparkles size={15} /></span></div><h3>{nextRank?.name ?? 'Legend'}</h3><p>{nextRank?.note ?? 'Leave no corner unexplored'}</p><div className="mini-progress"><span style={{ width: `${progress}%` }} /></div><small>{nextRank ? `${nextRank.min - points} points left` : 'You found them all'}</small></div>
            <div className="reward-list"><div className="rail-heading compact"><p className="eyebrow">Milestones</p><a href="#rewards">View all <ArrowUpRight size={13} /></a></div><div className="milestone"><div className="milestone-icon done"><Check size={15} /></div><div><strong>First steps</strong><span>Visit your first place</span></div><b>+40</b></div><div className={`milestone ${points < 150 ? 'locked' : ''}`}><div className="milestone-icon"><Star size={15} /></div><div><strong>Neighborhood regular</strong><span>Reach 150 points</span></div><b>+75</b></div><div className={`milestone ${points < 350 ? 'locked' : ''}`}><div className="milestone-icon"><Ticket size={15} /></div><div><strong>Campus insider</strong><span>Reach 350 points</span></div><b>+150</b></div></div>
            <div className="tip-card"><div className="tip-icon"><Sparkles size={18} /></div><div><strong>Field note</strong><p>Try visiting somewhere between classes. The best discoveries are usually on the way.</p></div></div>
          </aside>
        </div>
      </main>
      {toast && <div className="toast"><Check size={17} /> {toast}</div>}
    </div>
  )
}

export default App
