export function isHidden(
  entity: { isAnonymous: boolean } | null | undefined,
  owner: { isAnonymous: boolean }
) {
  return Boolean(entity?.isAnonymous) || owner.isAnonymous;
}
