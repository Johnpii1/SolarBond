import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SolarBond',
    short_name: 'SolarBond',
    description: 'Own a piece of the energy transition. From one dollar.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f3f5f1', // --canvas
    theme_color: '#f3f5f1', // --canvas (matches light mode theme color)
    icons: [
      {
        src: '/assets/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/assets/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
