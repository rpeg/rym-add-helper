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
