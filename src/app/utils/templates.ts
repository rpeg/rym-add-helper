import { Template } from '../types';

const Templates: {[index: string]: Template } = {
  'www.discogs.com': {
    artist: '#profile_title a',
    title: '#profile_title > span:nth-child(2)',
    type: '.content:nth-child(5)',
    format: '.content:nth-child(5)',
    discSize: '.content:nth-child(5)',
    discSpeed: '.content:nth-child(5)',
    date: '.content:nth-child(9) > a',
    label: '.content:nth-child(3) > a',
    catalogId: '.content:nth-child(3)',
    country: '.content:nth-child(7) > a',
    trackPositions: '.track .tracklist_track_pos',
    trackTitles: '.tracklist_track > .track > .tracklist_track_title',
    trackDurations: '.track .tracklist_track_duration > span',
  },
};

export default Templates;
