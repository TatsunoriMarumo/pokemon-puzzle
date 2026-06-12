import { en } from "./en";
import { ja } from "./ja";

export const lang = {
    ja,
    en
};

export type Language = keyof typeof lang;

const currentLanguage: Language = "ja";

export const t = lang[currentLanguage];
