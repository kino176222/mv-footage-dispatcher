export type FootageFile = {
    id: string;
    originalName: string;
    file: File;
    previewUrl: string;
    customName?: string;
};

export type VirtualFolder = {
    id: string;
    name: string;
    files: FootageFile[];
};
