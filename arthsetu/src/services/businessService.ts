export interface BusinessCollections {
  work: 'jobs' | 'services';
  team: 'workers' | 'staff';
}

export function resolveBusinessCollections(businessType?: string): BusinessCollections {
  if (businessType === 'service') {
    return { work: 'services', team: 'staff' };
  }
  return { work: 'jobs', team: 'workers' };
}
