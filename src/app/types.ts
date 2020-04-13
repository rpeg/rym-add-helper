export interface Template {
    artist: string,
    title: string,
    type: string,
    format: string,
    discSize?: string,
    discSpeed?: string,
    date: string,
    label: string,
    catalogId: string,
    country: string,
    trackPositions: string,
    trackTitles: string,
    trackDurations: string,
}

export interface Field {
    name: string,
    selector: string,
    label: string,
    data: string | Array<string> | Object | Array<Object>,
    dependency?: [Field, string],
    disabled?: boolean,
    transformers?: Array<Function>,
    format?: Function,
}

export interface RYMDate {
    month?: string,
    day?: string,
    year: string,
}

export interface RegexMap {
    regex: RegExp | string,
    mapTo: string
}

export enum ReleaseTypes {
    Album = 'Album',
    Comp = 'Compilation',
    EP = 'EP',
    Single = 'Single',
    Mixtape = 'Mixtape',
    Mix = 'DJ Mix',
    Bootleg = 'Bootleg',
    Video = 'Video'
}

export enum Formats {
    Vinyl = 'Vinyl',
    CD = 'CD',
    DigitalFile = 'Digital File',
    BluRay = 'Blu-ray',
    CDR = 'CD-R',
    DualDisc = 'DualDisc',
    DVD = 'DVD',
    DVDA = 'DVD-A',
    DVDR = 'DVD-R',
    HDAD = 'HDAD',
    HDCD = 'HDCD',
    Laserdisc = 'Laserdisc',
    MiniDisc = 'MiniDisc',
    SACD = 'SACD',
    UMD = 'UMD',
    VCD = 'VCD',
    Shellac = 'Shellac',
    EightTrack = '8 Track',
    FourTrack = '4 Track',
    Acetate = 'Acetate',
    Beta = 'Beta',
    Cassette = 'Cassette',
    DAT = 'DAT',
    DCC = 'DCC',
    Microcassette = 'Microcassette',
    PlayTape = 'PlayTape',
    ReelToReel = 'Reel-to-reel',
    VHS = 'VHS',
}

export enum DiscSpeeds {
    _16 = '16 rpm',
    _33 = '33 rpm',
    _45 = '45 rpm',
    _78 = '78 rpm',
    _80 = '80 rpm',
    // missing reel-to-reel
}
