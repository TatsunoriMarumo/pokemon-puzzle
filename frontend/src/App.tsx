import { GameControls } from "./components/game/GameControls";
import { DifficultySelector } from "./components/game/DifficultySelector";
import { GameHeader } from "./components/game/GameHeader";
import { GameStatus } from "./components/game/GameStatus";
import { Loading } from "./components/common/Loading";
import { PuzzleBoard } from "./components/puzzle/PuzzleBoard";
import { usePuzzleGame } from "./hooks/usePuzzleGame";

function App() {
  const game = usePuzzleGame();

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <GameHeader />

        <DifficultySelector
          difficulty={game.difficulty}
          onChangeDifficulty={game.changeDifficulty}
        />

        <GameControls
          onReset={game.resetPuzzle}
          onNextPokemon={() => game.loadNewPokemon()}
        />

        {game.isLoading && <Loading />}

        {!game.isLoading && game.pokemon && (
          <>
            <PuzzleBoard
              imageUrl={game.pokemon.imageUrl}
              pieces={game.pieces}
              gridSize={game.gridSize}
              isCompleted={game.isCompleted}
              onMovePiece={game.movePiece}
            />

            <GameStatus
              pokemonName={game.pokemon.japaneseName}
              isCompleted={game.isCompleted}
            />
          </>
        )}
      </div>
    </main>
  );
}

export default App;
