const templates = [
  {
    domain: 'discogs.com',
    artist: '#profile_title a',
    title: '#profile_title > span:nth-child(2)',
    releaseType: '.content:nth-child(5)',
    date: '.content:nth-child(9) > a',
    label: '.content:nth-child(3) > a',
    catalogId: '.content:nth-child(3)',
    country: '.content:nth-child(7) > a',
    tracks: '#tracklist > .section_content',
  },
];

export default templates;
