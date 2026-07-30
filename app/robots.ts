import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Служебные страницы разработчика не должны попадать в поиск,
      // даже если сборка случайно соберётся с NEXT_PUBLIC_DEV_PAGES=1.
      disallow: ['/dev/'],
    },
  }
}
