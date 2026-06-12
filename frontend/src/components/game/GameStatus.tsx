import { t } from "../../lang";

type Props = {
  pokemonName: string;
  isCompleted: boolean;
};

export function GameStatus({ pokemonName, isCompleted }: Props) {
  if (!isCompleted) {
    return <p className="text-center text-slate-600">{t.game.instruction}</p>;
  }

  return (
    <div className="text-center">
      <p className="text-2xl font-black text-red-500">{t.game.completed}</p>
      <p className="text-xl font-bold text-slate-800">{pokemonName}</p>
    </div>
  );
}
