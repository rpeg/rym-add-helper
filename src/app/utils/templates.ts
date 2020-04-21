import { Template } from '../types';

const Templates: {[index: string]: Template } = {
  discogs: {
    artist: '#profile_title a',
    title: '#profile_title > span:nth-child(2)',
    date: '.content:nth-child(9) > a',
    type: '.content:nth-child(5)',
    format: '.content:nth-child(5)',
    discSize: '.content:nth-child(5)',
    discSpeed: '.content:nth-child(5)',
    label: '.content:nth-child(3)',
    catalogId: '.content:nth-child(3)',
    countries: '.content:nth-child(7) > a',
    trackPositions: '.track .tracklist_track_pos',
    trackArtists: '',
    trackTitles: '.tracklist_track > .track > .tracklist_track_title',
    trackDurations: '.track .tracklist_track_duration > span',
  },
  bandcamp: {
    artist: 'h3 > span > a',
    title: '.trackTitle:nth-child(1)',
    date: '.tralbum-credits',
    type: '.buyItemPackageTitle',
    format: '.digitaldescription',
    discSize: '',
    discSpeed: '',
    label: '#band-name-location > .title',
    catalogId: '',
    countries: '.tralbum-tags',
    trackPositions: '.track_row_view .track_number',
    trackArtists: '.track_row_view .track-title',
    trackTitles: '.track_row_view .track-title',
    trackDurations: '.track_row_view .time',
  },
  boomkat: {
    artist: '.detail--artists > a',
    title: '.detail_album',
    date: '.product-note:nth-child(3)',
    type: '.product-review',
    format: '.active > a',
    discSize: '',
    discSpeed: '',
    label: '.label-placeholder',
    catalogId: '.catalogue-number-placeholder',
    countries: '',
    trackPositions: '.product-listing .table-row > .title',
    trackArtists: '',
    trackTitles: '.product-listing .table-row > .title',
    trackDurations: '.product-listing .table-row > .time',
  },
  'metal-archives': {
    artist: '.band_name > a',
    title: '.album_name > a',
    date: '.float_left > dd:nth-child(4)',
    type: '.float_left > dd:nth-child(2)',
    format: '.float_right > dd:nth-child(4)',
    discSize: '.float_right > dd:nth-child(4)',
    discSpeed: '.float_right > dd:nth-child(4)',
    label: 'dd:nth-child(2) > a',
    catalogId: '.float_left > dd:nth-child(6)',
    countries: '',
    trackPositions: '.table_lyrics .odd, .table_lyrics .even',
    trackArtists: '',
    trackTitles: '.wrapWords',
    trackDurations: '.table_lyrics .odd, .table_lyrics .even',
  },
  spotify: {
    artist: '.react-contextmenu-wrapper > a',
    title: '.mo-info-name > span',
    date: '.TrackListHeader__text-silence',
    type: '',
    format: '',
    discSize: '',
    discSpeed: '',
    label: 'p:nth-child(2) > span',
    catalogId: '',
    countries: '',
    trackPositions: '',
    trackArtists: '.tracklist-row__artist-name-link',
    trackTitles: '.tracklist-name',
    trackDurations: '.tracklist-duration > span',
  },
  musicbrainz: {
    artist: '.subheader > a > bdi',
    title: 'h1 bdi',
    date: '.release-date',
    type: '.type',
    format: '.format',
    discSize: '.format',
    discSpeed: '.format',
    label: '.links > li:nth-child(1) > a > bdi',
    catalogId: 'li:nth-child(1) > .catalog-number',
    countries: '.flag:nth-child(1) bdi',
    trackPositions: '.pos > a',
    trackArtists: '', // TODO: couldn't find a selector to grab artists that also works for standard releases
    trackTitles: '.odd > td > a > bdi, .even > td > a > bdi',
    trackDurations: 'td.treleases',
  },
};

export default Templates;
