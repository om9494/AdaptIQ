import { useEffect, useState } from 'react'

const useFetch = (requestFn, deps = []) => {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const run = async () => {
      try {
        setLoading(true)
        const res = await requestFn()
        if (active) {
          setData(res.data.data)
          setError(null)
        }
      } catch (err) {
        if (active) {
          setError(err)
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    run()
    return () => {
      active = false
    }
  }, deps)

  return { data, error, loading }
}

export default useFetch
