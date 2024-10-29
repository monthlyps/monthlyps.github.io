const TAG_VALUE = new Map([
  ["open", "Open Contest"],
  ["onsite", "Onsite"],
])

export function getTagValue(tag: string) {
  return TAG_VALUE.get(tag)
}
