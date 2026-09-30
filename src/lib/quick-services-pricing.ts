export function getExpertVisitName(serviceTitle: string = ''): string {
  const lowerCat = serviceTitle.toLowerCase();
  if (lowerCat.includes('security') || lowerCat.includes('bouncer')) {
    return 'Hiring Person/hr';
  } else if (lowerCat.includes('mechanic')) {
    return 'Mechanic Visit/hr';
  } else if (lowerCat.includes('electric')) {
    if (lowerCat.includes('commercial') || lowerCat.includes('lift') || lowerCat.includes('events')) {
      return 'Mechanic Visit/hr';
    }
    return 'Expert Visit/hr';
  } else if (
    lowerCat.includes('engineer') ||
    lowerCat.includes('computer') ||
    lowerCat.includes('printer') ||
    lowerCat.includes('mobile') ||
    lowerCat.includes('technician')
  ) {
    return 'Engineering Visit/hr';
  } else if (lowerCat.includes('wash')) {
    return 'Service Agent Visit/hr';
  }
  return 'Expert Visit/hr';
}

export function getQuickServiceHourlyRate(serviceTitle: string = ''): number {
  const lowerCat = serviceTitle.toLowerCase();
  
  if (lowerCat.includes('plumber') || lowerCat.includes('carpenter')) return 20.00;
  if (
    lowerCat.includes('computer') || 
    lowerCat.includes('electric') || 
    lowerCat.includes('lift') || 
    lowerCat.includes('appliance') || 
    lowerCat.includes('printer') || 
    lowerCat.includes('mobile')
  ) return 10.00;
  
  if (lowerCat.includes('mechanic')) {
    if (lowerCat.includes('car') || lowerCat.includes('truck')) return 9.00;
    if (lowerCat.includes('bike')) return 8.00;
    return 6.00;
  }
  
  if (lowerCat.includes('truck wash')) return 8.00;
  if (lowerCat.includes('security') || lowerCat.includes('hire person')) return 7.00;
  
  return 6.00;
}
