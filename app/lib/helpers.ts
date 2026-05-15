export function getText(prop: any) {
  if (!prop?.title?.[0]) return ""

  return prop.title[0].plain_text
}

export function getRichText(prop: any) {
  if (!prop?.rich_text?.[0]) return ""

  return prop.rich_text[0].plain_text
}

export function getSelect(prop: any) {
  return prop?.select?.name || ""
}

export function getMultiSelect(prop: any) {
  return prop?.multi_select?.map((x: any) => x.name) || []
}

export function getNumber(prop: any) {
  return prop?.number || 0
}

export function getPeople(prop: any) {
  return prop?.people || []
}