export = contributors;
declare const contributors: {
    order: number;
    sectionName: string;
    additionalClass: string;
    memberGroups: {
        additionalClass: string;
        members: ({
            name: string;
            position?: undefined;
        } | {
            position: string;
            name: string;
        })[];
    }[];
}[];
