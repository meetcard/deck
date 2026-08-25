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

/* ---- Data display ---------------------------------------------------- */
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

export { Select } from './components/Select'
export type { SelectProps, SelectOption } from './components/Select'

export { Checkbox } from './components/Checkbox'
export type { CheckboxProps } from './components/Checkbox'

export { Radio, RadioGroup } from './components/Radio'
export type { RadioProps, RadioGroupProps } from './components/Radio'

export { Switch } from './components/Switch'
export type { SwitchProps } from './components/Switch'

/* ---- MeetCard patterns ------------------------------------------------ */
export { MeetCard } from './components/MeetCard'
export type { MeetCardProps } from './components/MeetCard'

export { PersonCard } from './components/PersonCard'
export type { PersonCardProps } from './components/PersonCard'

export { CompanyCard } from './components/CompanyCard'
export type { CompanyCardProps } from './components/CompanyCard'

export { ContactCard } from './components/ContactCard'
export type { ContactCardProps, ContactDetail } from './components/ContactCard'
