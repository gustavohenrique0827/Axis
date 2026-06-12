import { useEffect, useState } from 'react'
import { supabase, AXIS } from './supabase'

const SITE_KEY = 'eempreenda'

export function useLandingSection<T>(section: string, fallback: T): [T, boolean] {
  const [data, setData]       = useState<T>(fallback)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('landing_configs')
      .select('content')
      .eq('tenant_id', AXIS.TENANT_ID)
      .eq('site_key', SITE_KEY)
      .eq('section', section)
      .maybeSingle()
      .then(({ data: row }) => {
        if (row?.content) setData(row.content as T)
        setLoading(false)
      })
  }, [section])

  return [data, loading]
}

export async function saveLandingSection(section: string, content: unknown) {
  return supabase.from('landing_configs').upsert(
    {
      tenant_id:  AXIS.TENANT_ID,
      site_key:   SITE_KEY,
      section,
      content,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'tenant_id,site_key,section' }
  )
}
