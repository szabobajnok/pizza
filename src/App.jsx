import { useEffect, useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import './App.css'
import PizzaDetails from './PizzaDetails'

const API_BASE = 'https://pizza.sulla.hu'

function pick(obj, candidates) {
  if (!obj) return undefined
  for (const k of candidates) {
    if (Object.prototype.hasOwnProperty.call(obj, k) && obj[k] != null) return obj[k]
  }
  return undefined
}

function resolveImage(img) {
  if (!img) return '/vite.svg'
  if (typeof img === 'string') {
    const s = img.trim()
    if (s.startsWith('http://') || s.startsWith('https://')) return s
    if (s.startsWith('/')) return `${API_BASE}${s}`
    return `${API_BASE}/${s}`
  }
  if (Array.isArray(img) && img.length) return resolveImage(img[0])
  if (typeof img === 'object') {
    // check common image properties including snake_case 'image_url'
    const keys = ['url', 'image', 'imageUrl', 'image_url', 'img', 'src', 'path', 'photo']
    for (const k of keys) {
      if (Object.prototype.hasOwnProperty.call(img, k) && img[k]) return resolveImage(img[k])
    }
  }
  return '/vite.svg'
}

function PizzaList() {
  const [pizzas, setPizzas] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/pizza`)
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      const data = await res.json()
      setPizzas(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      setError('Nem sikerült lekérni a pizzákat.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div id="root">
      <div className="mb-4 d-flex align-items-center justify-content-between">
        <h1>Pizza lista</h1>
        <div>
          <button className="btn btn-outline-secondary me-2" onClick={fetchAll} disabled={loading}>
            Frissít
          </button>
          <a className="btn btn-primary" href="https://pizza.sulla.hu/swagger/" target="_blank" rel="noreferrer">Swagger</a>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="mb-3">Betöltés…</div>}

      <div className="row">
        {pizzas.map((p) => {
          const id = pick(p, ['id', 'pizza_id', '_id', 'pk']) ?? JSON.stringify(p)
          const name = pick(p, ['name', 'nev', 'title']) ?? 'Név hiányzik'
          const description = pick(p, ['description', 'leiras', 'desc']) ?? ''
          const price = pick(p, ['price', 'ar', 'cost'])
          const image = resolveImage(pick(p, ['image', 'imageUrl', 'image_url', 'kep', 'img', 'photo']))

          return (
            <div className="col-12 col-md-6 col-lg-4 mb-4" key={id}>
              <div className="card h-100">
                {image ? (
                  <img src={image} className="card-img-top" alt={name} style={{ objectFit: 'cover', height: 200 }} onError={(e) => { e.currentTarget.src = '/vite.svg' }} />
                ) : (
                  <img src="/vite.svg" className="card-img-top" alt="placeholder" style={{ objectFit: 'cover', height: 200 }} />
                )}
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{name}</h5>
                  {description && <p className="card-text text-truncate">{description}</p>}
                  <div className="mt-auto d-flex justify-content-between align-items-center">
                    <div className="fw-semibold">{price ? `${price} Ft` : ''}</div>
                    <div>
                      <Link to={`/pizza/${id}`} className="btn btn-sm btn-outline-primary me-2">Részletek</Link>
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => navigator.clipboard?.writeText(id)}>Másol ID</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {!loading && pizzas.length === 0 && !error && (
        <div className="text-muted">Nincsenek pizzák a lista lekérésekor.</div>
      )}
    </div>
  )
}

export const App = () => {
  return (
    <Routes>
      <Route path="/" element={<PizzaList />} />
      <Route path="/pizza/:id" element={<PizzaDetails />} />
    </Routes>
  )
}

export default App
