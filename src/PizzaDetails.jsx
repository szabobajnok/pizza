import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

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
    const keys = ['url', 'image', 'imageUrl', 'image_url', 'img', 'src', 'path', 'photo']
    for (const k of keys) {
      if (Object.prototype.hasOwnProperty.call(img, k) && img[k]) return resolveImage(img[k])
    }
  }
  return '/vite.svg'
}

export const PizzaDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [pizza, setPizza] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchPizza() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${API_BASE}/pizza/${encodeURIComponent(id)}`)
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
        const data = await res.json()
        setPizza(data)
      } catch (err) {
        console.error(err)
        setError('Nem sikerült lekérni a pizza részleteit.')
      } finally {
        setLoading(false)
      }
    }
    fetchPizza()
  }, [id])

  if (loading) return <div className="container mt-4">Betöltés…</div>
  if (error) return (
    <div className="container mt-4">
      <div className="alert alert-danger">{error}</div>
      <button className="btn btn-secondary" onClick={() => navigate('/')}>Vissza a listához</button>
    </div>
  )
  if (!pizza) return null

  return (
    <div className="container mt-4">
      <button className="btn btn-secondary mb-3" onClick={() => navigate('/')}>← Vissza a listához</button>
      
      <div className="card">
        <div className="row g-0">
          <div className="col-md-5">
            <img
              src={resolveImage(pick(pizza, ['image', 'imageUrl', 'image_url', 'kep', 'img', 'photo']))}
              className="img-fluid rounded-start"
              alt={pick(pizza, ['name', 'nev', 'title'])}
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              onError={(e) => { e.currentTarget.src = '/vite.svg' }}
            />
          </div>
          <div className="col-md-7">
            <div className="card-body">
              <h2 className="card-title">{pick(pizza, ['name', 'nev', 'title'])}</h2>
              <p className="card-text">{pick(pizza, ['description', 'leiras', 'desc'])}</p>
              <p className="card-text"><small className="text-muted">ID: {pick(pizza, ['id', 'pizza_id', '_id', 'pk'])}</small></p>
              {pick(pizza, ['price', 'ar', 'cost']) && (
                <p className="card-text fs-4">
                  Ár: <strong className="text-success">{pick(pizza, ['price', 'ar', 'cost'])} Ft</strong>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PizzaDetails
