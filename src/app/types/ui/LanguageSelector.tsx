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

export interface PersonLoginSelector {
  id: string;
  name: string;
}

export interface PersonSelectorProps {
  label: string;
  persons: PersonLoginSelector[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}
