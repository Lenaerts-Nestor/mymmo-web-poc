export interface Language {
  code: string;
  name: string;
}

export interface LanguageSelectorProps {
  label: string;
  languages: Language[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}
