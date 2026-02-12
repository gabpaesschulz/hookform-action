import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearPersistedValues,
  debounce,
  loadPersistedValues,
  savePersistedValues,
} from '../persist'

describe('persist', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('saves and loads values from sessionStorage', () => {
    const key = 'test-form'
    const values = { email: 'a@b.com', name: 'Alice' }

    savePersistedValues(key, values)
    const loaded = loadPersistedValues(key)

    expect(loaded).toEqual(values)
  })

  it('returns null when no data is stored', () => {
    expect(loadPersistedValues('nonexistent')).toBeNull()
  })

  it('clears persisted values', () => {
    const key = 'test-form'
    savePersistedValues(key, { email: 'x@y.com' })
    clearPersistedValues(key)

    expect(loadPersistedValues(key)).toBeNull()
  })

  it('handles invalid JSON gracefully', () => {
    sessionStorage.setItem('bad-json', '{invalid')
    expect(loadPersistedValues('bad-json')).toBeNull()
  })
})

describe('debounce', () => {
  it('debounces function calls', async () => {
    let count = 0
    const fn = debounce(() => {
      count++
    }, 50)

    fn()
    fn()
    fn()

    expect(count).toBe(0)

    await new Promise((r) => setTimeout(r, 100))
    expect(count).toBe(1)
  })

  it('passes arguments to the debounced function', async () => {
    let received: string | undefined
    const fn = debounce((val: string) => {
      received = val
    }, 50)

    fn('hello')
    fn('world')

    await new Promise((r) => setTimeout(r, 100))
    expect(received).toBe('world')
  })
})
