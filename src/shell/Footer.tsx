'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Mark } from '../brand/Mark'

/**
 * Footer — quiet, honest. Includes "Talk to a human" (trust is shown, not
 * claimed) and a discreet link to the internal admin/oracle console.
 */
export function Footer() {
  const t = useTranslations('Footer')
  return (
    <footer className="hb-footer">
      <div className="hb-footer__inner">
        <div className="hb-footer__brand">
          <Mark size={24} />
          <span className="hb-footer__wordmark">SolarBond</span>
        </div>
        <div className="hb-footer__links">
          <nav className="hb-footer__nav" aria-label={t('trustLinks')}>
            <a href="/verify" className="hb-footer__link">
              {t('verify')}
            </a>
            <a href="/risk" className="hb-footer__link">
              {t('risk')}
            </a>
            <a href="/learn" className="hb-footer__link">
              {t('learn')}
            </a>
            <a href="/talk" className="hb-footer__link hb-footer__link--strong">
              {t('talk')}
            </a>
            <Link href="/admin" className="hb-footer__admin">
              {t('admin')}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
