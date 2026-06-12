export const ja = {
  app: {
    title: "ポケモンパズル",
  },

  difficulty: {
    easy: "イージー",
    normal: "ノーマル",
    hard: "ハード",
  },

  game: {
    loading: "読み込み中...",
    reset: "リセット",
    nextPokemon: "次のポケモン",
    completed: "完成！",
    instruction: "ピースをドラッグして並び替えてください。",
  },

  error: {
    apiRequestFailed: "ポケモンの取得に失敗しました。",
    apiBaseUrlMissing: "APIのベースURLが設定されていません。",
    audioContextNotSupported: "このブラウザは音声再生に対応していません。",
    audioFetchFailed: "ポケモンの鳴き声の取得に失敗しました。",
    audioDecodeFailed: "ポケモンの鳴き声の準備に失敗しました。",
    unexpectedError: "予期しないエラーが発生しました。",
  },
} as const;
