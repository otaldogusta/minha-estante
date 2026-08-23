export interface StoryBookData {
  id: number;
  titulo: string;
  autor: string;
  capa?: string | null;
  inicio?: string | null;
  fim?: string | null;
  nota?: number | null;
  paginas?: number | null;
  resenha?: string | null;
  genero?: string | null;
  formato?: string | null;
}

export type ModoStory = "rapido" | "completo";

export interface StoryPersonalizacao {
  modo: ModoStory;
  fotoKindleUrl: string | null;
  fotoComplementarUrl: string | null; // ex: print, anotação, trecho
  opiniao: string;
  mostrarAutor: boolean;
  mostrarDatas: boolean;
  mostrarNota: boolean;
  mostrarPaginas: boolean;
  mostrarOpiniao: boolean;
  mostrarFotoKindle: boolean;
  mostrarPrintSkoob: boolean;
  tema: "editorial-escuro";
}
