import { useEffect } from 'react'
import { siteUrl } from '../../utils/seo'

const DEFAULT_TITLE = 'LMS Vera | Học tiếng Anh và tiếng Việt trực tuyến'
const DEFAULT_DESCRIPTION =
  'LMS Vera là nền tảng học tiếng Anh và tiếng Việt trực tuyến với lộ trình rõ ràng, video bài học, quiz, giáo viên hỗ trợ và theo dõi tiến độ học tập.'
const DEFAULT_IMAGE = `${siteUrl}/images/vera-language-classroom-hero.png`

interface SeoProps {
  title?: string
  description?: string
  path?: string
  image?: string
  type?: string
  noindex?: boolean
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
}

export function Seo({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  image = DEFAULT_IMAGE,
  type = 'website',
  noindex = false,
  jsonLd,
}: SeoProps) {
  useEffect(() => {
    const url = `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`
    document.title = title

    setMeta('description', description)
    setMeta('robots', noindex ? 'noindex,nofollow' : 'index,follow')
    setLink('canonical', noindex ? undefined : url)

    setMetaProperty('og:title', title)
    setMetaProperty('og:description', description)
    setMetaProperty('og:type', type)
    setMetaProperty('og:url', url)
    setMetaProperty('og:image', image)

    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', title)
    setMeta('twitter:description', description)
    setMeta('twitter:image', image)

    setJsonLd(jsonLd)
  }, [description, image, jsonLd, noindex, path, title, type])

  return null
}

export function NoIndexSeo({ title = 'LMS Vera' }: { title?: string }) {
  return <Seo title={title} description="Private LMS Vera workspace." noindex />
}

function setMeta(name: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute('name', name)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

function setMetaProperty(property: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute('property', property)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

function setLink(rel: string, href?: string) {
  const selector = `link[rel="${rel}"]`
  const existing = document.head.querySelector<HTMLLinkElement>(selector)

  if (!href) {
    existing?.remove()
    return
  }

  const element = existing || document.createElement('link')
  element.setAttribute('rel', rel)
  element.setAttribute('href', href)
  if (!existing) {
    document.head.appendChild(element)
  }
}

function setJsonLd(jsonLd?: Record<string, unknown> | Record<string, unknown>[]) {
  const id = 'vera-json-ld'
  const existing = document.getElementById(id)
  if (!jsonLd) {
    existing?.remove()
    return
  }

  const element = existing || document.createElement('script')
  element.id = id
  element.setAttribute('type', 'application/ld+json')
  element.textContent = JSON.stringify(jsonLd)
  if (!existing) {
    document.head.appendChild(element)
  }
}
