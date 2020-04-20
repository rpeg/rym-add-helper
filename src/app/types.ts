export type HashMap<K extends string, V> = {
    [k in K]: V;
}

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
    countries: string,
    trackPositions: string,
    trackArtists?: string,
    trackTitles: string,
    trackDurations: string,
}

export interface FormData {
    [key: string]: string | Array<Object> | Array<string> | Object,

    url: string,
    id: string,
    artist: string,
    title: string,
    type: string,
    format: string,
    discSize?: string,
    discSpeed?: string,
    date: string,
    label: string,
    catalogId: string,
    countries: Array<string>,
    tracks: Array<RYMTrack>
}

/**
 * Apply transform in DOM pruning step if field's selector matches one or more specified fields'
 */
export interface UniqueFromTransformer {
    uniqueFrom: Array<Field>, // fields which may be in same elm and need additional parsing
    transform: Function
}

export type Data = string | Array<string> | Object | Array<Object>;

export interface Dependency {
    field: Field,
    data: Data,
}

export interface Field {
    name: string,
    selector: string,
    label: string,
    placeholder?: string, // for <input />
    default: Data,
    data?: Data,
    dependency?: Dependency, // fields conditional upon another field's value
    disabled?: boolean,
    options?: Array<string>,
    uniqueFromTransformer?: UniqueFromTransformer,
    selectorTransformer?: Function,
    dataTransformers?: Array<Function>,
    format?: Function,
}

export interface RYMTrack {
    position: string,
    title: string,
    duration: string,
    artist?: string, // for VA releases
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

export enum DiscSizes {
    _12 = '12"',
    _10 = '10"',
    _7 = '7"',
    _5 = '5"',
    _3 = '3"',
    _16 = '16"',
    _11 = '11"',
    _9 = '9"',
    _8 = '8"',
    _6 = '6"',
    _4 = '4"',
    Other = 'Non-Standard'
}
