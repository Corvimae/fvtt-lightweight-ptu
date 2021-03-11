export function getTagsForItem(item) {
  switch (item.type) {
    case 'feature':
      return [
        `Target: ${item.data.data.target || 'None'}`,
        ...item.data.data.tags.split(/,/g).map(tag => tag.trim()).filter(item => item.length > 0)
      ];

    default:
      return [];
  }
}