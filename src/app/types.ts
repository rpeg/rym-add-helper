export interface Template {
    artist: string,
    title: string,
    type: string,
    format: string,
    discSize: string,
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
    promptLabel: string,
    formLabel: string,
    data: string | Array<string>,
    transformers?: Array<Function>,
}

export interface RYMDate {
    year: string,
    month?: string,
    day?: string,
}

export interface RegexMap {
    regexes: Array<string>,
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
    DigitalFile = 'Digital File',
    BluRay = 'Blu-ray',
    CD = 'CD',
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
    Vinyl = 'Vinyl',
    Shellac = 'Shellac',
    EightTrack = '8 Track',
    FourTrack = '4 Track'
}

export enum Months {
    January = 'January',
    February = 'February',
    March = 'March',
    April = 'April',
    May = 'May',
    June = 'June',
    July = 'July',
    August = 'August',
    September = 'September',
    October = 'October',
    November = 'November',
    December = 'December'
}
