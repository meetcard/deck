/**
 * Deck Design System — public API.
 *
 * Everything MeetCard products may import lives here. Internal modules
 * (`lib/`, individual `.css` files, component-private helpers) are
 * deliberately not re-exported, so they stay free to change.
 *
 * Import the stylesheet once at your app root:
 *   import '@meetcard/deck/styles.css'
 */

/* ---- Foundations ---------------------------------------------------- */
export {
  space,
  spaceVar,
  radius,
  shadow,
  breakpoints,
  mediaQuery,
  typeScales,
  colorTokens,
  colorVar,
} from './foundations/tokens'

export type {
  Space,
  Radius,
  Shadow,
  Breakpoint,
  DisplaySize,
  HeadingSize as TypeHeadingSize,
  BodySize,
  LabelSize,
  ColorGroup,
} from './foundations/tokens'

export { Mark, Wordmark } from './foundations/brand'
export type { MarkProps, WordmarkProps } from './foundations/brand'

/* ---- Typography ----------------------------------------------------- */
export { Text } from './components/Text'
export type {
  TextProps,
  TextSize,
  TextTone,
  TextWeight,
  TextElement,
} from './components/Text'

export { Heading } from './components/Heading'
export type {
  HeadingProps,
  HeadingSize,
  HeadingLevel,
  HeadingTone,
} from './components/Heading'

/* ---- Layout ---------------------------------------------------------- */
export { Stack } from './components/Stack'
export type {
  StackProps,
  StackAlign,
  StackJustify,
  StackElement,
} from './components/Stack'

export { Divider } from './components/Divider'
export type { DividerProps } from './components/Divider'

export { Card, CardHeader, CardBody, CardFooter } from './components/Card'
export type {
  CardProps,
  CardSectionProps,
  CardSurface,
  CardElement,
} from './components/Card'

/* ---- Actions --------------------------------------------------------- */
export { Button } from './components/Button'
export type {
  ButtonProps,
  ButtonVariant,
  ButtonSize,
} from './components/Button'

export { IconButton } from './components/IconButton'
export type { IconButtonProps } from './components/IconButton'

export { Link } from './components/Link'
export type { LinkProps, LinkTone } from './components/Link'

/* ---- Feedback -------------------------------------------------------- */
export { Banner } from './components/Banner'
export type { BannerProps, BannerTone } from './components/Banner'

export { EmptyState } from './components/EmptyState'
export type { EmptyStateProps } from './components/EmptyState'

export { Spinner } from './components/Spinner'
export type { SpinnerProps, SpinnerSize } from './components/Spinner'

/* ---- Overlays -------------------------------------------------------- */
export { Sheet } from './components/Sheet'
export type { SheetProps } from './components/Sheet'

export { ShareSheet } from './components/ShareSheet'
export type { ShareSheetProps } from './components/ShareSheet'

/* ---- Application shell ------------------------------------------------ */
export { AppBar } from './components/AppBar'
export type { AppBarProps } from './components/AppBar'

export { BottomNav } from './components/BottomNav'
export type {
  BottomNavProps,
  BottomNavItemProps,
} from './components/BottomNav'

export { SideNav } from './components/SideNav'
export type { SideNavProps, SideNavItemProps } from './components/SideNav'

/* ---- Navigation & progress -------------------------------------------- */
export { Stepper } from './components/Stepper'
export type { StepperProps, Step } from './components/Stepper'

/* ---- Scheduling ------------------------------------------------------- */
export { ChoiceGroup } from './components/ChoiceGroup'
export type {
  ChoiceGroupProps,
  ChoiceGroupVariant,
  ChoiceOption,
} from './components/ChoiceGroup'

export { DayStrip } from './components/DayStrip'
export type { DayStripProps, DayOption } from './components/DayStrip'

export { TimeSlotPicker } from './components/TimeSlotPicker'
export type { TimeSlotPickerProps, TimeSlot } from './components/TimeSlotPicker'

export { BookingSummary } from './components/BookingSummary'
export type {
  BookingSummaryProps,
  BookingSummaryItem,
} from './components/BookingSummary'

/* ---- Data display ---------------------------------------------------- */
export { StatTile } from './components/StatTile'
export type { StatTileProps, TrendDirection } from './components/StatTile'

export { UsageMeter } from './components/UsageMeter'
export type { UsageMeterProps } from './components/UsageMeter'

export { Tag } from './components/Tag'
export type { TagProps } from './components/Tag'

export { QRCode } from './components/QRCode'
export type { QRCodeProps, QRCodeSize } from './components/QRCode'

export { CopyField } from './components/CopyField'
export type { CopyFieldProps } from './components/CopyField'

export { Badge } from './components/Badge'
export type {
  BadgeProps,
  BadgeTone,
  BadgeVariant,
  BadgeSize,
} from './components/Badge'

export { Avatar, getInitials } from './components/Avatar'
export type {
  AvatarProps,
  AvatarSize,
  AvatarShape,
} from './components/Avatar'

/* ---- Forms ----------------------------------------------------------- */
export { Field } from './components/Field'
export type { FieldProps } from './components/Field'
export type { ControlSize } from './components/Field/Field'

export { Input } from './components/Input'
export type { InputProps } from './components/Input'

export { Textarea } from './components/Textarea'
export type { TextareaProps } from './components/Textarea'

export { SearchField } from './components/SearchField'
export type { SearchFieldProps } from './components/SearchField'

export { Select } from './components/Select'
export type { SelectProps, SelectOption } from './components/Select'

export { Checkbox } from './components/Checkbox'
export type { CheckboxProps } from './components/Checkbox'

export { Radio, RadioGroup } from './components/Radio'
export type { RadioProps, RadioGroupProps } from './components/Radio'

export { Switch } from './components/Switch'
export type { SwitchProps } from './components/Switch'

/* ---- MeetCard patterns ------------------------------------------------ */
export { CardPile } from './components/CardPile'
export type { CardPileProps } from './components/CardPile'

export { PersonCard } from './components/PersonCard'
export type { PersonCardProps } from './components/PersonCard'

export { CompanyCard } from './components/CompanyCard'
export type { CompanyCardProps } from './components/CompanyCard'

export { ContactCard } from './components/ContactCard'
export type { ContactCardProps, ContactDetail } from './components/ContactCard'

export { EventCard } from './components/EventCard'
export type { EventCardProps } from './components/EventCard'

/* ---- Events ------------------------------------------------------------ */
export { EventCalendar } from './components/EventCalendar'
export type {
  EventCalendarProps,
  EventCalendarMarkedDate,
  EventCalendarDateStatus,
} from './components/EventCalendar'

export { RsvpControl } from './components/RsvpControl'
export type { RsvpControlProps, RsvpStatus, RsvpCounts } from './components/RsvpControl'

export { EventMetaList } from './components/EventMetaList'
export type { EventMetaListProps, EventMetaItem } from './components/EventMetaList'

export { AttendeeList } from './components/AttendeeList'
export type { AttendeeListProps, EventAttendee } from './components/AttendeeList'
