export const stateEnum = {
  Merged: { state: 'MERGED', name: 'Merged' },
  Closed: { state: 'CLOSED', name: 'Closed' },
  Open: { state: 'OPEN', name: 'Open' },
}

export const orderingEnum = {
  Oldest: { order: 'ASC', name: 'Oldest' },
  Newest: { order: 'DESC', name: 'Newest' },
}

export const fitlerItems = [
  stateEnum.Open.name,
  stateEnum.Merged.name,
  stateEnum.Closed.name,
]

export const orderItems = [orderingEnum.Newest.name, orderingEnum.Oldest.name]