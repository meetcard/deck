import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  Clock,
  Download,
  Globe,
  Laptop,
  Mail,
  Nfc,
  Pin,
  QrCode,
  Smartphone,
  Tablet,
  Wallet,
} from 'lucide-react'
import { BreakdownList } from '../../components/BreakdownList/BreakdownList'
import type { BreakdownItem } from '../../components/BreakdownList/BreakdownList'
import { Button } from '../../components/Button/Button'
import { Card } from '../../components/Card/Card'
import { ChoiceGroup } from '../../components/ChoiceGroup/ChoiceGroup'
import { Funnel } from '../../components/Funnel/Funnel'
import { Heading } from '../../components/Heading/Heading'
import { Stack } from '../../components/Stack/Stack'
import { StatTile } from '../../components/StatTile/StatTile'
import { Text } from '../../components/Text/Text'
import { TrendChart } from '../../components/TrendChart/TrendChart'
import type { TrendPoint } from '../../components/TrendChart/TrendChart'
import './Analytics.css'

/* ---- Model -------------------------------------------------------------

   The range changes the counts; it does not change the mix. Shares of
   traffic, device and geography are stable properties of how a card gets
   passed around, so they are held once as fractions and multiplied by the
   period's view total. Writing three hand-made copies of every table would
   invite them to disagree, and a demo whose devices add up to 103% in one
   range and 97% in another teaches the wrong thing about the component. */

type RangeId = '7d' | '30d' | '90d'

interface Period {
  label: string
  /** Top of the funnel for the period. Everything else is derived from it. */
  views: number
  /** Fractions of `views` reaching each subsequent funnel stage. */
  clickRate: number
  saveRate: number
  meetingRate: number
  /** Change against the period before, as whole percents. */
  trend: { views: number; saves: number; meetings: number }
  /** Buckets for the time series — days, weeks or months, as the span suits. */
  series: TrendPoint[]
}

const PERIODS: Record<RangeId, Period> = {
  '7d': {
    label: '7 days',
    views: 412,
    clickRate: 0.46,
    saveRate: 0.16,
    meetingRate: 0.028,
    trend: { views: 9, saves: 4, meetings: 11 },
    series: [
      { label: 'M', value: 48, fullLabel: 'Monday' },
      { label: 'T', value: 71, fullLabel: 'Tuesday' },
      { label: 'W', value: 66, fullLabel: 'Wednesday' },
      { label: 'T', value: 94, fullLabel: 'Thursday' },
      { label: 'F', value: 58, fullLabel: 'Friday' },
      { label: 'S', value: 39, fullLabel: 'Saturday' },
      { label: 'S', value: 36, fullLabel: 'Sunday' },
    ],
  },
  '30d': {
    label: '30 days',
    views: 1684,
    clickRate: 0.44,
    saveRate: 0.15,
    meetingRate: 0.026,
    trend: { views: 12, saves: 7, meetings: 15 },
    series: [
      { label: 'W1', value: 312, fullLabel: 'Week 1' },
      { label: 'W2', value: 428, fullLabel: 'Week 2' },
      { label: 'W3', value: 517, fullLabel: 'Week 3' },
      { label: 'W4', value: 427, fullLabel: 'Week 4' },
    ],
  },
  '90d': {
    label: '90 days',
    views: 4310,
    clickRate: 0.41,
    saveRate: 0.14,
    meetingRate: 0.022,
    trend: { views: 26, saves: 19, meetings: 22 },
    series: [
      { label: 'Mar', value: 1104, fullLabel: 'March' },
      { label: 'Apr', value: 1522, fullLabel: 'April' },
      { label: 'May', value: 1684, fullLabel: 'May' },
    ],
  },
}

/** Shares of the period's views. Each table sums to 1. */
const MIX = {
  sources: [
    { label: 'QR', share: 0.37, icon: <QrCode /> },
    { label: 'LinkedIn', share: 0.23, icon: <Globe /> },
    { label: 'NFC', share: 0.14, icon: <Nfc /> },
    { label: 'Email', share: 0.12, icon: <Mail /> },
    { label: 'Wallet', share: 0.08, icon: <Wallet /> },
    { label: 'Direct', share: 0.06, icon: <Globe /> },
  ],
  locations: [
    { label: 'United States', share: 0.63 },
    { label: 'Canada', share: 0.13 },
    { label: 'United Kingdom', share: 0.1 },
    { label: 'Germany', share: 0.07 },
    { label: 'Other', share: 0.07 },
  ],
  devices: [
    { label: 'Mobile', share: 0.76, icon: <Smartphone /> },
    { label: 'Desktop', share: 0.19, icon: <Laptop /> },
    { label: 'Tablet', share: 0.05, icon: <Tablet /> },
  ],
  browsers: [
    { label: 'Safari', share: 0.48 },
    { label: 'Chrome', share: 0.38 },
    { label: 'Edge', share: 0.08 },
    { label: 'Firefox', share: 0.06 },
  ],
} satisfies Record<string, { label: string; share: number; icon?: ReactNode }[]>

/** Clicks per call to action, as a share of views. */
const LINKS = [
  { label: 'Book a time', share: 0.177 },
  { label: 'Save contact', share: 0.151 },
  { label: 'LinkedIn profile', share: 0.076 },
  { label: 'Company site', share: 0.037 },
]

const CAMPAIGNS = [
  { channel: 'QR', slug: 'revops-summit', share: 0.214, meetings: 14 },
  { channel: 'LinkedIn', slug: 'linkedin-bio', share: 0.148, meetings: 11 },
  { channel: 'Email', slug: 'email-signature', share: 0.1, meetings: 6 },
  { channel: 'NFC', slug: 'saastr-booth', share: 0.084, meetings: 7 },
]

const BEST_TIMES = [
  { day: 'Thursday', window: '10–11am' },
  { day: 'Tuesday', window: '2–3pm' },
  { day: 'Wednesday', window: '9–10am' },
]

const pct = (ratio: number) => `${Math.round(ratio * 100)}%`

/** Counts derived from a share of the period, rounded once at the edge. */
function fromShares(
  rows: { label: string; share: number; icon?: ReactNode }[],
  views: number,
): BreakdownItem[] {
  return rows.map((row) => ({
    label: row.label,
    icon: row.icon,
    value: Math.round(row.share * views),
    meta: pct(row.share),
  }))
}

/* ---- Section ------------------------------------------------------------ */

interface SectionProps {
  id: string
  title: string
  /** A figure or note that belongs beside the title, e.g. "Engagement 44%". */
  aside?: string
  description?: string
  pinned: boolean
  onPinnedChange: (pinned: boolean) => void
  children: ReactNode
}

/**
 * A panel with its own heading and a pin. Pinning is a real toggle rather
 * than a link, so it reports `aria-pressed` and the label says which way it
 * will go — "Pin Audience to dashboard" / "Unpin …" — because a bare "Pin"
 * repeated eight times down a page names nothing.
 */
function Section({
  id,
  title,
  aside,
  description,
  pinned,
  onPinnedChange,
  children,
}: SectionProps) {
  return (
    <Card as="section" aria-labelledby={id} className="analytics__section">
      <div className="analytics__section-header">
        <div className="analytics__section-heading">
          <Heading id={id} level={2} size="sm">
            {title}
          </Heading>
          {aside ? (
            <Text size="sm" tone="muted">
              {aside}
            </Text>
          ) : null}
        </div>

        <Button
          size="sm"
          variant={pinned ? 'secondary' : 'ghost'}
          iconStart={<Pin aria-hidden="true" />}
          aria-pressed={pinned}
          onClick={() => onPinnedChange(!pinned)}
        >
          <span className="deck-visually-hidden">
            {pinned ? `Unpin ${title} from dashboard` : `Pin ${title} to dashboard`}
          </span>
          <span aria-hidden="true">{pinned ? 'Pinned' : 'Pin'}</span>
        </Button>
      </div>

      {description ? (
        <Text size="sm" tone="muted" className="analytics__section-description">
          {description}
        </Text>
      ) : null}

      <div className="analytics__section-body">{children}</div>
    </Card>
  )
}

/* ---- Page --------------------------------------------------------------- */

export interface AnalyticsProps {
  /** Which span the page opens on. */
  defaultRange?: RangeId
}

/**
 * Advanced analytics — why the numbers on the dashboard are moving.
 *
 * The dashboard answers *how many*; this page answers *why*, which is why it
 * is a separate destination rather than a longer dashboard. Every panel is
 * one question, and each can be pinned back to the dashboard, so the summary
 * screen is assembled from the answers a particular person keeps rereading
 * rather than from a fixed guess about what everyone wants.
 *
 * The range control sits above everything and changes the counts throughout.
 * The mix — sources, devices, geography — is held as shares and multiplied
 * out, because that is what the mix actually is: switching to 90 days should
 * not re-poll the world's browser share.
 *
 * Nothing persists. Pins live for as long as the page does.
 */
export function Analytics({ defaultRange = '30d' }: AnalyticsProps) {
  const [range, setRange] = useState<RangeId>(defaultRange)
  const [pinned, setPinned] = useState<Record<string, boolean>>({
    funnel: true,
  })

  const period = PERIODS[range]

  const figures = useMemo(() => {
    const views = period.views
    const clicks = Math.round(views * period.clickRate)
    const saves = Math.round(views * period.saveRate)
    const meetings = Math.round(views * period.meetingRate)
    const unique = Math.round(views * 0.8)

    return { views, clicks, saves, meetings, unique, returning: views - unique }
  }, [period])

  const pin = (id: string) => ({
    pinned: Boolean(pinned[id]),
    onPinnedChange: (next: boolean) =>
      setPinned((all) => ({ ...all, [id]: next })),
  })

  return (
    <div className="analytics">
      <Stack gap={24} className="analytics__container">
        <Stack gap={4}>
          <Text size="xs" tone="muted" className="analytics__eyebrow">
            Advanced analytics
          </Text>
          <Heading level={1} size="xl" family="serif">
            Analytics
          </Heading>
          <Text tone="muted">
            Why your numbers are moving — and what to do about it. Pin any
            section to your dashboard.
          </Text>
        </Stack>

        <div className="analytics__toolbar">
          <ChoiceGroup
            label="Date range"
            hideLabel
            options={(Object.keys(PERIODS) as RangeId[]).map((id) => ({
              value: id,
              label: PERIODS[id].label,
            }))}
            value={range}
            onChange={(next) => setRange(next as RangeId)}
          />
          <Button
            variant="secondary"
            size="sm"
            iconStart={<Download aria-hidden="true" />}
          >
            Export CSV
          </Button>
        </div>

        {/* The three the dashboard leads with, repeated here so the panels
            below have something to be a breakdown *of*. */}
        <div className="analytics__stats">
          <StatTile
            label="Profile views"
            value={figures.views.toLocaleString()}
            caption={`vs previous ${period.label}`}
            trend={{ direction: 'up', label: `${period.trend.views}%` }}
            positiveDirection="up"
          />
          <StatTile
            label="Contacts saved"
            value={figures.saves.toLocaleString()}
            caption={`vs previous ${period.label}`}
            trend={{ direction: 'up', label: `${period.trend.saves}%` }}
            positiveDirection="up"
          />
          <StatTile
            label="Meetings booked"
            value={figures.meetings.toLocaleString()}
            caption={`vs previous ${period.label}`}
            trend={{ direction: 'up', label: `${period.trend.meetings}%` }}
            positiveDirection="up"
          />
        </div>

        <Section
          id="analytics-funnel"
          title="Conversion funnel"
          aside={`Engagement rate ${pct(period.clickRate)}`}
          description="Did someone see you, engage, connect, and take the next step?"
          {...pin('funnel')}
        >
          <Funnel
            label="Conversion funnel"
            unit="views"
            stages={[
              {
                label: 'Profile views',
                value: figures.views,
                description: 'Everyone who opened your card',
              },
              {
                label: 'Link clicks',
                value: figures.clicks,
                description: 'Tapped a link or CTA',
              },
              {
                label: 'Contacts saved',
                value: figures.saves,
                description: 'Kept your details',
              },
              {
                label: 'Meetings booked',
                value: figures.meetings,
                description: 'Book with Me + connected calendars',
              },
            ]}
          />
        </Section>

        <Section
          id="analytics-over-time"
          title="Views over time"
          {...pin('over-time')}
        >
          <TrendChart
            label="Profile views over time"
            unit="views"
            points={period.series}
          />
        </Section>

        <Section
          id="analytics-sources"
          title="Where engagement comes from"
          {...pin('sources')}
        >
          <BreakdownList
            label="Where engagement comes from"
            scale="total"
            items={fromShares(MIX.sources, figures.views)}
          />
        </Section>

        <Section id="analytics-audience" title="Audience" {...pin('audience')}>
          <div className="analytics__pair">
            <StatTile
              label="Unique visitors"
              value={figures.unique.toLocaleString()}
              caption="80% of views"
            />
            <StatTile
              label="Returning"
              value={figures.returning.toLocaleString()}
              caption="20% came back"
            />
          </div>

          <Heading level={3} size="xs" className="analytics__subheading">
            Top locations
          </Heading>
          <BreakdownList
            label="Top locations"
            scale="total"
            items={fromShares(MIX.locations, figures.views)}
          />
        </Section>

        <Section
          id="analytics-devices"
          title="Devices & browsers"
          {...pin('devices')}
        >
          <BreakdownList
            label="Devices"
            scale="total"
            items={fromShares(MIX.devices, figures.views)}
          />

          <Heading level={3} size="xs" className="analytics__subheading">
            Browsers
          </Heading>
          <BreakdownList
            label="Browsers"
            scale="total"
            items={fromShares(MIX.browsers, figures.views)}
          />
        </Section>

        <Section
          id="analytics-links"
          title="Link performance"
          {...pin('links')}
        >
          <BreakdownList
            label="Link performance"
            items={LINKS.map((link) => {
              const clicks = Math.round(link.share * figures.views)
              return {
                label: link.label,
                value: clicks,
                valueLabel: `${clicks.toLocaleString()} clicks`,
                meta: `${pct(link.share)} CTR`,
              }
            })}
          />
        </Section>

        <Section
          id="analytics-best-times"
          title="Best times to share"
          {...pin('best-times')}
        >
          <ul className="analytics__times">
            {BEST_TIMES.map((slot) => (
              <li key={slot.day} className="analytics__time">
                <Clock aria-hidden="true" className="analytics__time-icon" />
                <span className="analytics__time-day">{slot.day}</span>
                <span className="analytics__time-window">{slot.window}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          id="analytics-campaigns"
          title="Campaigns"
          description="Tagged links and QR codes, attributed by campaign."
          {...pin('campaigns')}
        >
          <BreakdownList
            label="Campaigns"
            items={CAMPAIGNS.map((campaign) => {
              const views = Math.round(campaign.share * figures.views)
              return {
                id: campaign.slug,
                label: campaign.slug,
                icon: <QrCode />,
                value: views,
                valueLabel: `${views.toLocaleString()} views`,
                meta: `${campaign.meetings} meetings · ${campaign.channel}`,
              }
            })}
          />
        </Section>

        {/* Where the numbers come from, said once at the foot. People
            reasonably distrust a dashboard that will not say what it counts. */}
        <Text size="xs" tone="muted">
          Sharing and location data comes from your share links; contacts
          saved, follow-ups and meetings come from your MeetCard activity.
        </Text>
      </Stack>
    </div>
  )
}
